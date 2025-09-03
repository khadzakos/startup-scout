package entities

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID      `json:"id" db:"id"`
	Username          string         `json:"username" db:"username"`
	Email             string         `json:"email" db:"email"`
	PasswordHash      string         `json:"-" db:"password_hash"`
	Avatar            string         `json:"avatar" db:"avatar"`
	AuthType          AuthType       `json:"auth_type" db:"auth_type"`
	AuthID            string         `json:"auth_id" db:"auth_id"`
	TelegramID        *int64         `json:"telegram_id" db:"telegram_id"`
	IsActive          bool           `json:"is_active" db:"is_active"`
	EmailVerified     bool           `json:"email_verified" db:"email_verified"`
	VerificationToken sql.NullString `json:"-" db:"verification_token"`
	CreatedAt         time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at" db:"updated_at"`
}

type AuthType string

const (
	AuthTypeEmail    AuthType = "email"
	AuthTypeTelegram AuthType = "telegram"
	AuthTypeYandex   AuthType = "yandex"
)
