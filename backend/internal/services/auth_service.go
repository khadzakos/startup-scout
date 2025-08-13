package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"strings"
	"time"
)

type AuthService struct {
	userRepo repository.UserRepository
	config   AuthConfig
}

type AuthConfig struct {
	TelegramBotToken   string
	YandexClientID     string
	YandexClientSecret string
	JWTSecret          string
	SessionDuration    time.Duration
}

func NewAuthService(userRepo repository.UserRepository, config AuthConfig) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		config:   config,
	}
}

type TelegramAuthData struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	PhotoURL  string `json:"photo_url"`
	AuthDate  int64  `json:"auth_date"`
	Hash      string `json:"hash"`
}

func (s *AuthService) AuthenticateTelegram(ctx context.Context, data map[string]string) (*entities.User, error) {
	// Проверяем подпись от Telegram
	if !s.verifyTelegramHash(data) {
		return nil, fmt.Errorf("invalid telegram hash")
	}

	// Парсим данные
	authData := &TelegramAuthData{}
	if err := s.parseTelegramData(data, authData); err != nil {
		return nil, err
	}

	// Проверяем, что данные не устарели (не старше 24 часов)
	if time.Now().Unix()-authData.AuthDate > 86400 {
		return nil, fmt.Errorf("auth data is too old")
	}

	// Ищем пользователя или создаем нового
	user, err := s.userRepo.GetByAuthID(ctx, fmt.Sprintf("%d", authData.ID), entities.AuthTypeTelegram)
	if err == nil && user != nil {
		return user, nil
	}

	// Создаем нового пользователя
	user = &entities.User{
		Username:  authData.Username,
		Avatar:    authData.PhotoURL,
		AuthType:  entities.AuthTypeTelegram,
		AuthID:    fmt.Sprintf("%d", authData.ID),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) verifyTelegramHash(data map[string]string) bool {
	hash := data["hash"]
	delete(data, "hash")

	// Сортируем ключи
	var keys []string
	for k := range data {
		keys = append(keys, k)
	}

	// Создаем строку для проверки
	var pairs []string
	for _, k := range keys {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, data[k]))
	}
	dataCheckString := strings.Join(pairs, "\n")

	// Создаем HMAC
	h := hmac.New(sha256.New, []byte(s.config.TelegramBotToken))
	h.Write([]byte(dataCheckString))
	expectedHash := hex.EncodeToString(h.Sum(nil))

	return hash == expectedHash
}

func (s *AuthService) parseTelegramData(data map[string]string, authData *TelegramAuthData) error {
	// Парсим ID
	if id, ok := data["id"]; ok {
		if _, err := fmt.Sscanf(id, "%d", &authData.ID); err != nil {
			return err
		}
	}

	authData.FirstName = data["first_name"]
	authData.LastName = data["last_name"]
	authData.Username = data["username"]
	authData.PhotoURL = data["photo_url"]
	authData.Hash = data["hash"]

	if authDate, ok := data["auth_date"]; ok {
		if _, err := fmt.Sscanf(authDate, "%d", &authData.AuthDate); err != nil {
			return err
		}
	}

	return nil
}

type YandexAuthData struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

type YandexUserInfo struct {
	ID        string `json:"id"`
	Login     string `json:"login"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	RealName  string `json:"real_name"`
	AvatarID  string `json:"avatar_id"`
	Email     string `json:"default_email"`
}

func (s *AuthService) AuthenticateYandex(ctx context.Context, code string) (*entities.User, error) {
	// Получаем access token
	authData, err := s.getYandexAccessToken(code)
	if err != nil {
		return nil, err
	}

	// Получаем информацию о пользователе
	userInfo, err := s.getYandexUserInfo(authData.AccessToken)
	if err != nil {
		return nil, err
	}

	// Ищем пользователя или создаем нового
	user, err := s.userRepo.GetByAuthID(ctx, userInfo.ID, entities.AuthTypeYandex)
	if err == nil && user != nil {
		return user, nil
	}

	// Создаем нового пользователя
	user = &entities.User{
		Username:  userInfo.Login,
		Email:     userInfo.Email,
		Avatar:    fmt.Sprintf("https://avatars.yandex.net/get-yapic/%s/islands-200", userInfo.AvatarID),
		AuthType:  entities.AuthTypeYandex,
		AuthID:    userInfo.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) getYandexAccessToken(code string) (*YandexAuthData, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", s.config.YandexClientID)
	data.Set("client_secret", s.config.YandexClientSecret)

	resp, err := http.PostForm("https://oauth.yandex.ru/token", data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var authData YandexAuthData
	if err := json.NewDecoder(resp.Body).Decode(&authData); err != nil {
		return nil, err
	}

	return &authData, nil
}

func (s *AuthService) getYandexUserInfo(accessToken string) (*YandexUserInfo, error) {
	req, err := http.NewRequest("GET", "https://login.yandex.ru/info", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "OAuth "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var userInfo YandexUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}
