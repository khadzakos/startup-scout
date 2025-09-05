package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"

	"github.com/google/uuid"
)

type Project struct {
	db *clients.PostgresClient
}

func NewProjectRepository(db *clients.PostgresClient) repository.ProjectRepository {
	return &Project{db: db}
}

func (r *Project) Create(ctx context.Context, project *entities.Project) error {
	query := `
		INSERT INTO projects (
			name, 
			description, 
			full_description, 
			logo,
			images, 
			creators, 
			telegram_contact, 
			website, 
			launch_id,
			user_id,
			created_at, 
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`

	var id uuid.UUID
	err := r.db.GetDB().QueryRowContext(ctx, query,
		project.Name,
		project.Description,
		project.FullDescription,
		project.Logo,
		project.Images,
		project.Creators,
		project.TelegramContact,
		project.Website,
		project.LaunchID,
		project.UserID,
		project.CreatedAt,
		project.UpdatedAt,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}

	project.ID = id
	return nil
}

func (r *Project) GetByID(ctx context.Context, id uuid.UUID) (*entities.Project, error) {
	query := `
		SELECT * FROM projects WHERE id = $1
	`
	var project entities.Project
	err := r.db.GetDB().GetContext(ctx, &project, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get project by id: %w", err)
	}

	return &project, nil
}

func (r *Project) GetByLaunchID(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error) {
	query := `
		SELECT * FROM projects WHERE launch_id = $1
	`
	var projects []*entities.Project
	err := r.db.GetDB().SelectContext(ctx, &projects, query, launchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects by launch id: %w", err)
	}

	return projects, nil
}

func (r *Project) GetByLaunchIDOrderedByRating(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error) {
	query := `
		SELECT * FROM projects WHERE launch_id = $1 ORDER BY rating DESC
	`
	var projects []*entities.Project
	err := r.db.GetDB().SelectContext(ctx, &projects, query, launchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects by launch id ordered by rating: %w", err)
	}

	return projects, nil
}

func (r *Project) Update(ctx context.Context, project *entities.Project) error {
	query := `
		UPDATE projects SET 
			name = :name, 
			description = :description, 
			full_description = :full_description, 
			images = :images, 
			creators = :creators, 
			telegram_contact = :telegram_contact, 
			website = :website, 
			upvotes = :upvotes,
			rating = :rating,
			updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, project)
	if err != nil {
		return fmt.Errorf("failed to update project: %w", err)
	}

	return nil
}

func (r *Project) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM projects WHERE id = $1
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}

	return nil
}

func (r *Project) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Project, error) {
	query := `
		SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC
	`
	var projects []*entities.Project
	err := r.db.GetDB().SelectContext(ctx, &projects, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects by user id: %w", err)
	}

	return projects, nil
}
