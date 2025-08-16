package services

import (
	"context"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"time"
)

type CommentService struct {
	commentRepo repository.CommentRepository
}

func NewCommentService(commentRepo repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

func (s *CommentService) CreateComment(ctx context.Context, userID, projectID int64, content string) (*entities.Comment, error) {
	comment := &entities.Comment{
		UserID:    userID,
		ProjectID: projectID,
		Content:   content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *CommentService) GetProjectComments(ctx context.Context, projectID int64) ([]*entities.Comment, error) {
	return s.commentRepo.GetByProjectID(ctx, projectID)
}

func (s *CommentService) UpdateComment(ctx context.Context, commentID, userID int64, content string) error {
	comment := &entities.Comment{
		ID:        commentID,
		UserID:    userID,
		Content:   content,
		UpdatedAt: time.Now(),
	}

	return s.commentRepo.Update(ctx, comment)
}

func (s *CommentService) DeleteComment(ctx context.Context, commentID int64) error {
	return s.commentRepo.Delete(ctx, commentID)
}
