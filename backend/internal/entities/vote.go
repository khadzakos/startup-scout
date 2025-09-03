package entities

import (
	"time"

	"github.com/google/uuid"
)

type Vote struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	ProjectID uuid.UUID `json:"project_id" db:"project_id"`
	LaunchID  uuid.UUID `json:"launch_id" db:"launch_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// VoteType больше не нужен, так как у нас только лайки
// type VoteType string

// const (
// 	VoteTypeUp   VoteType = "up"
// 	VoteTypeDown VoteType = "down"
// )
