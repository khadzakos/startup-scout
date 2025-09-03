package services

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"time"

	"github.com/google/uuid"
)

type CommentService struct {
	commentRepo repository.CommentRepository
}

func NewCommentService(commentRepo repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

func (s *CommentService) CreateComment(ctx context.Context, userID, projectID uuid.UUID, content string) (*entities.Comment, error) {
	comment := &entities.Comment{
		UserID:    userID,
		ProjectID: projectID,
		Content:   content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return comment, nil
}

func (s *CommentService) GetProjectComments(ctx context.Context, projectID uuid.UUID) ([]*entities.Comment, error) {
	return s.commentRepo.GetByProjectID(ctx, projectID)
}

func (s *CommentService) UpdateComment(ctx context.Context, commentID, userID uuid.UUID, content string) error {
	// Получаем комментарий для проверки принадлежности
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("failed to get comment: %w", err)
	}

	// Проверяем, что комментарий принадлежит пользователю
	if comment.UserID != userID {
		return fmt.Errorf("comment does not belong to user")
	}

	// Обновляем содержимое и время
	comment.Content = content
	comment.UpdatedAt = time.Now()

	return s.commentRepo.Update(ctx, comment)
}

func (s *CommentService) DeleteComment(ctx context.Context, commentID, userID uuid.UUID) error {
	// Получаем комментарий для проверки принадлежности
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		return fmt.Errorf("failed to get comment: %w", err)
	}

	// Проверяем, что комментарий принадлежит пользователю
	if comment.UserID != userID {
		return fmt.Errorf("comment does not belong to user")
	}

	return s.commentRepo.Delete(ctx, commentID)
}
