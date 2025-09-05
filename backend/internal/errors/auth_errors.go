package errors

import "errors"

// Authentication errors
var (
	ErrUserNotFound        = errors.New("user not found")
	ErrInvalidPassword     = errors.New("invalid password")
	ErrEmailExists         = errors.New("user with this email already exists")
	ErrUsernameExists      = errors.New("user with this username already exists")
	ErrInvalidTelegramHash = errors.New("invalid telegram hash")
)
