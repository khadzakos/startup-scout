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
	"sort"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

// Удаляем метод AuthenticateTelegram - теперь только связывание

func (s *AuthService) verifyTelegramHash(data map[string]string) bool {
	hash := data["hash"]

	// Создаем копию данных без hash для проверки
	checkData := make(map[string]string)
	for k, v := range data {
		if k != "hash" {
			checkData[k] = v
		}
	}

	// Сортируем ключи в алфавитном порядке
	var keys []string
	for k := range checkData {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Создаем строку для проверки согласно документации
	var pairs []string
	for _, k := range keys {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, checkData[k]))
	}
	dataCheckString := strings.Join(pairs, "\n")

	// Создаем секретный ключ как SHA256 хеш токена бота
	secretKey := sha256.Sum256([]byte(s.config.TelegramBotToken))

	// Создаем HMAC согласно документации
	h := hmac.New(sha256.New, secretKey[:])
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
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// Email авторизация
func (s *AuthService) RegisterEmail(ctx context.Context, email, username, password string) (*entities.User, error) {
	// Проверяем, что пользователь с таким email не существует
	existingUser, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Хешируем пароль
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Создаем нового пользователя
	user := &entities.User{
		Email:        email,
		Username:     username,
		PasswordHash: string(passwordHash),
		AuthType:     entities.AuthTypeEmail,
		AuthID:       email, // Используем email как AuthID для email авторизации
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) AuthenticateEmail(ctx context.Context, email, password string) (*entities.User, error) {
	// Получаем пользователя по email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Проверяем пароль
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	return user, nil
}

// Связывание Telegram с существующим пользователем
func (s *AuthService) LinkTelegramToUser(ctx context.Context, userID uuid.UUID, telegramData map[string]string) error {
	// Проверяем хеш Telegram
	if !s.verifyTelegramHash(telegramData) {
		return fmt.Errorf("invalid telegram hash")
	}

	// Парсим данные Telegram
	var authData TelegramAuthData
	if err := s.parseTelegramData(telegramData, &authData); err != nil {
		return fmt.Errorf("failed to parse telegram data: %w", err)
	}

	// Связываем Telegram ID с пользователем
	if err := s.userRepo.LinkTelegram(ctx, userID, authData.ID); err != nil {
		return fmt.Errorf("failed to link telegram: %w", err)
	}

	return nil
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
