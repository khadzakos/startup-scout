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
			username, 
			email, 
			password_hash,
			avatar, 
			auth_type, 
			auth_id, 
			telegram_id,
			is_active,
			created_at, 
			updated_at
		)
		VALUES (:username, :email, :password_hash, :avatar, :auth_type, :auth_id, :telegram_id, :is_active, :created_at, :updated_at)
		RETURNING id
	`
	rows, err := r.db.GetDB().NamedQueryContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	defer rows.Close()

	if rows.Next() {
		if err := rows.Scan(&user.ID); err != nil {
			return fmt.Errorf("failed to get created user id: %w", err)
		}
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
		username = :username, 
		email = :email, 
		password_hash = :password_hash,
		avatar = :avatar, 
		telegram_id = :telegram_id,
		is_active = :is_active,
		updated_at = :updated_at
		WHERE id = :id
	`
	_, err := r.db.GetDB().NamedExecContext(ctx, query, user)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

func (r *User) GetByEmail(
	ctx context.Context,
	email string,
) (*entities.User, error) {
	query := `
		SELECT * FROM users WHERE email = $1 AND is_active = true
	`
	var user entities.User
	err := r.db.GetDB().GetContext(ctx, &user, query, email)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return &user, nil
}

func (r *User) GetByTelegramID(
	ctx context.Context,
	telegramID int64,
) (*entities.User, error) {
	query := `
		SELECT * FROM users WHERE telegram_id = $1 AND is_active = true
	`
	var user entities.User
	err := r.db.GetDB().GetContext(ctx, &user, query, telegramID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by telegram id: %w", err)
	}

	return &user, nil
}

func (r *User) LinkTelegram(
	ctx context.Context,
	userID int64,
	telegramID int64,
) error {
	query := `
		UPDATE users SET telegram_id = $1, updated_at = NOW() WHERE id = $2
	`
	_, err := r.db.GetDB().ExecContext(ctx, query, telegramID, userID)
	if err != nil {
		return fmt.Errorf("failed to link telegram: %w", err)
	}

	return nil
}
