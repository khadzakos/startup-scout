package repository

import (
	"context"
	"startup-scout/internal/entities"

	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error)
	GetByAuthID(ctx context.Context, authID string, authType entities.AuthType) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	GetByTelegramID(ctx context.Context, telegramID int64) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	LinkTelegram(ctx context.Context, userID uuid.UUID, telegramID int64) error
}

type ProjectRepository interface {
	Create(ctx context.Context, project *entities.Project) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Project, error)
	GetByLaunchID(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error)
	GetByLaunchIDOrderedByRating(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Project, error)
	Update(ctx context.Context, project *entities.Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type LaunchRepository interface {
	Create(ctx context.Context, launch *entities.Launch) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Launch, error)
	GetActive(ctx context.Context) (*entities.Launch, error)
	GetAll(ctx context.Context) ([]*entities.Launch, error)
	Update(ctx context.Context, launch *entities.Launch) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetProjectsByLaunchID(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error)
}

type VoteRepository interface {
	Create(ctx context.Context, vote *entities.Vote) error
	GetByUserAndProject(ctx context.Context, userID, projectID, launchID uuid.UUID) (*entities.Vote, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Vote, error)
	Update(ctx context.Context, vote *entities.Vote) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetProjectVotes(ctx context.Context, projectID uuid.UUID) (int, error) // только количество лайков
}

type CommentRepository interface {
	Create(ctx context.Context, comment *entities.Comment) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Comment, error)
	GetByProjectID(ctx context.Context, projectID uuid.UUID) ([]*entities.Comment, error)
	Update(ctx context.Context, comment *entities.Comment) error
	Delete(ctx context.Context, id uuid.UUID) error
}
