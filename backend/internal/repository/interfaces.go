package repository

import (
	"context"
	"startup-scout/internal/entities"
)

type UserRepository interface {
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id int64) (*entities.User, error)
	GetByAuthID(ctx context.Context, authID string, authType entities.AuthType) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
}

type ProjectRepository interface {
	Create(ctx context.Context, project *entities.Project) error
	GetByID(ctx context.Context, id int64) (*entities.Project, error)
	GetByLaunchID(ctx context.Context, launchID int64) ([]*entities.Project, error)
	GetByLaunchIDOrderedByRating(ctx context.Context, launchID int64) ([]*entities.Project, error)
	Update(ctx context.Context, project *entities.Project) error
	Delete(ctx context.Context, id int64) error
}

type LaunchRepository interface {
	Create(ctx context.Context, launch *entities.Launch) error
	GetByID(ctx context.Context, id int64) (*entities.Launch, error)
	GetActive(ctx context.Context) (*entities.Launch, error)
	GetAll(ctx context.Context) ([]*entities.Launch, error)
	Update(ctx context.Context, launch *entities.Launch) error
	Delete(ctx context.Context, id int64) error
	GetProjectsByLaunchID(ctx context.Context, launchID int64) ([]*entities.Project, error)
}

type VoteRepository interface {
	Create(ctx context.Context, vote *entities.Vote) error
	GetByUserAndProject(ctx context.Context, userID, projectID, launchID int64) (*entities.Vote, error)
	Update(ctx context.Context, vote *entities.Vote) error
	Delete(ctx context.Context, id int64) error
	GetProjectVotes(ctx context.Context, projectID int64) (int, int, error) // upvotes, downvotes
}

type CommentRepository interface {
	Create(ctx context.Context, comment *entities.Comment) error
	GetByProjectID(ctx context.Context, projectID int64) ([]*entities.Comment, error)
	Update(ctx context.Context, comment *entities.Comment) error
	Delete(ctx context.Context, id int64) error
}
