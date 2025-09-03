package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"
	"time"

	"github.com/google/uuid"
)

type Vote struct {
	db *clients.PostgresClient
}

func NewVoteRepository(db *clients.PostgresClient) repository.VoteRepository {
	return &Vote{db: db}
}

func (r *Vote) Create(ctx context.Context, vote *entities.Vote) error {
	query := `
		INSERT INTO votes (
			user_id, 
			project_id, 
			launch_id, 
			created_at
		)
		VALUES (:user_id, :project_id, :launch_id, :created_at)
	`

	// Устанавливаем время создания
	vote.CreatedAt = time.Now()

	_, err := r.db.GetDB().NamedExecContext(ctx, query, vote)
	if err != nil {
		return fmt.Errorf("failed to create vote: %w", err)
	}

	return nil
}

func (r *Vote) GetByUserAndProject(ctx context.Context, userID, projectID, launchID uuid.UUID) (*entities.Vote, error) {
	query := `
		SELECT * FROM votes 
		WHERE user_id = $1 AND project_id = $2 AND launch_id = $3
	`
	var vote entities.Vote
	err := r.db.GetDB().GetContext(ctx, &vote, query, userID, projectID, launchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get vote by user and project: %w", err)
	}

	return &vote, nil
}

func (r *Vote) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Vote, error) {
	query := `
		SELECT * FROM votes 
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	var votes []*entities.Vote
	err := r.db.GetDB().SelectContext(ctx, &votes, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get votes by user: %w", err)
	}

	return votes, nil
}

func (r *Vote) Update(ctx context.Context, vote *entities.Vote) error {
	query := `
		UPDATE votes SET created_at = :created_at WHERE id = :id
	`

	// Обновляем время
	vote.CreatedAt = time.Now()

	_, err := r.db.GetDB().NamedExecContext(ctx, query, vote)
	if err != nil {
		return fmt.Errorf("failed to update vote: %w", err)
	}

	return nil
}

func (r *Vote) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM votes WHERE id = $1
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete vote: %w", err)
	}

	return nil
}

func (r *Vote) GetProjectVotes(ctx context.Context, projectID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*) FROM votes WHERE project_id = $1
	`
	var count int
	err := r.db.GetDB().GetContext(ctx, &count, query, projectID)
	if err != nil {
		return 0, fmt.Errorf("failed to get project votes: %w", err)
	}

	return count, nil
}
