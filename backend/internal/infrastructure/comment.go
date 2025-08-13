package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"
)

type Comment struct {
	db *clients.PostgresClient
}

func NewCommentRepository(db *clients.PostgresClient) repository.CommentRepository {
	return &Comment{db: db}
}

func (r *Comment) Create(
	ctx context.Context,
	comment *entities.Comment,
) error {
	query := `
		INSERT INTO comments (
			user_id, 
			project_id, 
			content, 
			created_at, 
			updated_at
		)
		VALUES (:user_id, :project_id, :content, :created_at, :updated_at)
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, comment)
	if err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}

	return nil
}

func (r *Comment) GetByProjectID(
	ctx context.Context,
	projectID int64,
) ([]*entities.Comment, error) {
	query := `
		SELECT * FROM comments WHERE project_id = $1
	`
	var comments []*entities.Comment
	err := r.db.GetDB().SelectContext(ctx, &comments, query, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get comments by project id: %w", err)
	}

	return comments, nil
}

func (r *Comment) Update(
	ctx context.Context,
	comment *entities.Comment,
) error {
	query := `
		UPDATE comments SET content = :content, updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, comment)
	if err != nil {
		return fmt.Errorf("failed to update comment: %w", err)
	}

	return nil
}

func (r *Comment) Delete(
	ctx context.Context,
	id int64,
) error {
	query := `
		DELETE FROM comments WHERE id = $1
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}
