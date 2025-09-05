package entities

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID              uuid.UUID   `json:"id" db:"id"`
	Name            string      `json:"name" db:"name"`
	Description     string      `json:"description" db:"description"`
	FullDescription string      `json:"full_description" db:"full_description"`
	Logo            *string     `json:"logo" db:"logo"`
	Images          StringArray `json:"images" db:"images"`
	Creators        StringArray `json:"creators" db:"creators"`
	TelegramContact string      `json:"telegram_contact" db:"telegram_contact"`
	Website         string      `json:"website" db:"website"`
	Upvotes         int         `json:"upvotes" db:"upvotes"`
	Rating          int         `json:"rating" db:"rating"` // equals upvotes
	LaunchID        uuid.UUID   `json:"launch_id" db:"launch_id"`
	UserID          uuid.UUID   `json:"user_id" db:"user_id"`
	CreatedAt       time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at" db:"updated_at"`
}

type Launch struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	StartDate time.Time `json:"start_date" db:"start_date"`
	EndDate   time.Time `json:"end_date" db:"end_date"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
