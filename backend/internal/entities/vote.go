package entities

import (
	"time"
)

type Vote struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	ProjectID int64     `json:"project_id" db:"project_id"`
	LaunchID  int64     `json:"launch_id" db:"launch_id"`
	VoteType  VoteType  `json:"vote_type" db:"vote_type"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type VoteType string

const (
	VoteTypeUp   VoteType = "up"
	VoteTypeDown VoteType = "down"
)
