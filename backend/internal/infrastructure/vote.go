package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"
)

type Vote struct {
	db *clients.PostgresClient
}

func NewVoteRepository(db *clients.PostgresClient) repository.VoteRepository {
	return &Vote{db: db}
}

type ProjectVotes struct {
	Upvotes   int `db:"upvotes"`
	Downvotes int `db:"downvotes"`
}

func (r *Vote) Create(ctx context.Context, vote *entities.Vote) error {
	query := `
		INSERT INTO votes (
			user_id, 
			project_id, 
			launch_id, 
			vote_type, 
			created_at, 
			updated_at
		)
		VALUES (:user_id, :project_id, :launch_id, :vote_type, :created_at, :updated_at)
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, vote)
	if err != nil {
		return fmt.Errorf("failed to create vote: %w", err)
	}

	return nil
}

func (r *Vote) GetByUserAndProject(ctx context.Context, userID, projectID, launchID int64) (*entities.Vote, error) {
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

func (r *Vote) Update(ctx context.Context, vote *entities.Vote) error {
	query := `
		UPDATE votes SET vote_type = :vote_type, updated_at = :updated_at WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, vote)
	if err != nil {
		return fmt.Errorf("failed to update vote: %w", err)
	}

	return nil
}

func (r *Vote) Delete(ctx context.Context, id int64) error {
	query := `
		DELETE FROM votes WHERE id = $1
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete vote: %w", err)
	}

	return nil
}

func (r *Vote) GetProjectVotes(ctx context.Context, projectID int64) (int, int, error) {
	query := `
		SELECT 
			SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) AS upvotes,
			SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) AS downvotes
		FROM votes 
		WHERE project_id = $1
	`

	var projectVotes ProjectVotes
	err := r.db.GetDB().GetContext(ctx, &projectVotes, query, projectID)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get project votes: %w", err)
	}

	return projectVotes.Upvotes, projectVotes.Downvotes, nil
}
