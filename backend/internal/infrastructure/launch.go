package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"

	"github.com/google/uuid"
)

type Launch struct {
	db *clients.PostgresClient
}

func NewLaunchRepository(db *clients.PostgresClient) repository.LaunchRepository {
	return &Launch{db: db}
}

func (r *Launch) Create(ctx context.Context, launch *entities.Launch) error {
	query := `
		INSERT INTO launches (
			name, 
			start_date, 
			end_date, 
			is_active,
			created_at, 
			updated_at
		)
		VALUES (:name, :start_date, :end_date, :is_active, :created_at, :updated_at)
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, launch)
	if err != nil {
		return fmt.Errorf("failed to create launch: %w", err)
	}

	return nil
}

func (r *Launch) GetByID(ctx context.Context, id uuid.UUID) (*entities.Launch, error) {
	query := `
		SELECT * FROM launches WHERE id = $1
	`
	var launch entities.Launch
	err := r.db.GetDB().GetContext(ctx, &launch, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get launch by id: %w", err)
	}

	return &launch, nil
}

func (r *Launch) GetActive(ctx context.Context) (*entities.Launch, error) {
	query := `
		SELECT * FROM launches WHERE is_active = true AND end_date > NOW()
	`
	var launch entities.Launch
	err := r.db.GetDB().GetContext(ctx, &launch, query)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil, fmt.Errorf("no active launch found")
		}
		return nil, fmt.Errorf("failed to get active launch: %w", err)
	}

	return &launch, nil
}

func (r *Launch) GetAll(ctx context.Context) ([]*entities.Launch, error) {
	query := `
		SELECT * FROM launches
	`
	var launches []*entities.Launch
	err := r.db.GetDB().SelectContext(ctx, &launches, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all launches: %w", err)
	}

	return launches, nil
}

func (r *Launch) Update(ctx context.Context, launch *entities.Launch) error {
	query := `
		UPDATE launches SET name = :name, start_date = :start_date, end_date = :end_date, is_active = :is_active, updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, launch)
	if err != nil {
		return fmt.Errorf("failed to update launch: %w", err)
	}

	return nil
}

func (r *Launch) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM launches WHERE id = $1
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete launch: %w", err)
	}

	return nil
}

func (r *Launch) GetProjectsByLaunchID(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error) {
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
