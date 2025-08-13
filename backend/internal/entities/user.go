package entities

import (
	"time"
)

type User struct {
	ID        int64     `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Avatar    string    `json:"avatar" db:"avatar"`
	AuthType  AuthType  `json:"auth_type" db:"auth_type"`
	AuthID    string    `json:"auth_id" db:"auth_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type AuthType string

const (
	AuthTypeTelegram AuthType = "telegram"
	AuthTypeYandex   AuthType = "yandex"
)
