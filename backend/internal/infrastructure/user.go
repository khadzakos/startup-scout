package infrastructure

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"startup-scout/pkg/clients"
)

type User struct {
	db *clients.PostgresClient
}

func NewUserRepository(db *clients.PostgresClient) repository.UserRepository {
	return &User{db: db}
}

func (r *User) Create(
	ctx context.Context,
	user *entities.User,
) error {
	query := `
		INSERT INTO users (
			name, 
			email, 
			password, 
			created_at, 
			updated_at
		)
		VALUES (:name, :email, :password, :created_at, :updated_at)
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *User) GetByID(
	ctx context.Context,
	id int64,
) (*entities.User, error) {
	query := `
		SELECT * FROM users WHERE id = $1
	`
	var user entities.User
	err := r.db.GetDB().GetContext(ctx, &user, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	return &user, nil
}

func (r *User) GetByAuthID(
	ctx context.Context,
	authID string,
	authType entities.AuthType,
) (*entities.User, error) {
	query := `
		SELECT * FROM users 
		WHERE auth_id = $1 AND auth_type = $2
	`
	var user entities.User
	err := r.db.GetDB().GetContext(ctx, &user, query, authID, authType)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by auth id: %w", err)
	}

	return &user, nil
}

func (r *User) Update(
	ctx context.Context,
	user *entities.User,
) error {
	query := `
		UPDATE users SET 
		name = :name, 
		email = :email, 
		password = :password, 
		updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}
