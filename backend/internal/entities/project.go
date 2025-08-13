package entities

import (
	"time"
)

type Project struct {
	ID              int64     `json:"id" db:"id"`
	Name            string    `json:"name" db:"name"`
	Description     string    `json:"description" db:"description"`
	FullDescription string    `json:"full_description" db:"full_description"`
	Images          []string  `json:"images" db:"images"`
	Creators        []string  `json:"creators" db:"creators"`
	TelegramContact string    `json:"telegram_contact" db:"telegram_contact"`
	Website         string    `json:"website" db:"website"`
	Upvotes         int       `json:"upvotes" db:"upvotes"`
	Downvotes       int       `json:"downvotes" db:"downvotes"`
	Rating          int       `json:"rating" db:"rating"` // upvotes - downvotes
	LaunchID        int64     `json:"launch_id" db:"launch_id"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type Launch struct {
	ID        int64     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	StartDate time.Time `json:"start_date" db:"start_date"`
	EndDate   time.Time `json:"end_date" db:"end_date"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
