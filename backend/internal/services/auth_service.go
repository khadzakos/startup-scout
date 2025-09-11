package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sort"
	"startup-scout/internal/entities"
	"startup-scout/internal/errors"
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
	TelegramBotToken string
	JWTSecret        string
	SessionDuration  time.Duration
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

// Email авторизация
func (s *AuthService) RegisterEmail(ctx context.Context, email, username, password string) (*entities.User, error) {
	// Проверяем, что пользователь с таким email не существует
	existingUser, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, errors.ErrEmailExists
	}

	// Проверяем, что пользователь с таким username не существует
	existingUserByUsername, err := s.userRepo.GetByUsername(ctx, username)
	if err == nil && existingUserByUsername != nil {
		return nil, errors.ErrUsernameExists
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

func (s *AuthService) AuthenticateEmail(ctx context.Context, login, password string) (*entities.User, error) {
	var user *entities.User
	var err error

	// Определяем, является ли login email или username
	if strings.Contains(login, "@") {
		// Если содержит @, ищем по email
		user, err = s.userRepo.GetByEmail(ctx, login)
	} else {
		// Иначе ищем по username
		user, err = s.userRepo.GetByUsername(ctx, login)
	}

	if err != nil {
		return nil, errors.ErrUserNotFound
	}

	// Проверяем пароль
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.ErrInvalidPassword
	}

	return user, nil
}

// Связывание Telegram с существующим пользователем
func (s *AuthService) LinkTelegramToUser(ctx context.Context, userID uuid.UUID, telegramData map[string]string) error {
	// Проверяем хеш Telegram
	if !s.verifyTelegramHash(telegramData) {
		return errors.ErrInvalidTelegramHash
	}

	// Парсим данные Telegram
	var authData TelegramAuthData
	if err := s.parseTelegramData(telegramData, &authData); err != nil {
		return errors.ErrInvalidTelegramHash
	}

	// Связываем Telegram ID с пользователем
	if err := s.userRepo.LinkTelegram(ctx, userID, authData.ID); err != nil {
		return fmt.Errorf("failed to link telegram: %w", err)
	}

	return nil
}
