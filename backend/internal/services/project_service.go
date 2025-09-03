package services

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	projectRepo repository.ProjectRepository
	voteRepo    repository.VoteRepository
	launchRepo  repository.LaunchRepository
}

func NewProjectService(
	projectRepo repository.ProjectRepository,
	voteRepo repository.VoteRepository,
	launchRepo repository.LaunchRepository,
) *ProjectService {
	return &ProjectService{
		projectRepo: projectRepo,
		voteRepo:    voteRepo,
		launchRepo:  launchRepo,
	}
}

func (s *ProjectService) CreateProject(ctx context.Context, project *entities.Project) error {
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err != nil {
		return fmt.Errorf("failed to get active launch: %w", err)
	}

	project.CreatedAt = time.Now()
	project.UpdatedAt = time.Now()
	project.Upvotes = 0
	project.Rating = 0
	project.LaunchID = activeLaunch.ID

	return s.projectRepo.Create(ctx, project)
}

func (s *ProjectService) GetProject(ctx context.Context, id uuid.UUID) (*entities.Project, error) {
	return s.projectRepo.GetByID(ctx, id)
}

func (s *ProjectService) GetProjectsByLaunch(ctx context.Context, launchID uuid.UUID) ([]*entities.Project, error) {
	return s.projectRepo.GetByLaunchIDOrderedByRating(ctx, launchID)
}

func (s *ProjectService) GetActiveLaunchProjects(ctx context.Context) ([]*entities.Project, error) {
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err != nil {
		return nil, err
	}

	projects, err := s.projectRepo.GetByLaunchIDOrderedByRating(ctx, activeLaunch.ID)
	if err != nil {
		return nil, err
	}

	if projects == nil {
		return []*entities.Project{}, nil
	}

	return projects, nil
}

func (s *ProjectService) Vote(ctx context.Context, userID, projectID uuid.UUID) error {
	// Получаем активный запуск
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err != nil {
		return err
	}

	// Проверяем, есть ли уже лайк от этого пользователя
	existingVote, err := s.voteRepo.GetByUserAndProject(ctx, userID, projectID, activeLaunch.ID)
	if err == nil && existingVote != nil {
		// Если лайк уже есть, ничего не делаем (или можно вернуть ошибку)
		return nil
	}

	// Создаем новый лайк
	vote := &entities.Vote{
		UserID:    userID,
		ProjectID: projectID,
		LaunchID:  activeLaunch.ID,
		CreatedAt: time.Now(),
	}

	if err := s.voteRepo.Create(ctx, vote); err != nil {
		return err
	}

	// Обновляем рейтинг проекта
	return s.updateProjectRating(ctx, projectID)
}

// RemoveVote удаляет лайк пользователя за проект
func (s *ProjectService) RemoveVote(ctx context.Context, userID, projectID uuid.UUID) error {
	// Получаем активный запуск
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err != nil {
		return err
	}

	// Проверяем, есть ли лайк от этого пользователя
	existingVote, err := s.voteRepo.GetByUserAndProject(ctx, userID, projectID, activeLaunch.ID)
	if err != nil || existingVote == nil {
		// Лайка нет, ничего не делаем
		return nil
	}

	// Удаляем лайк
	if err := s.voteRepo.Delete(ctx, existingVote.ID); err != nil {
		return err
	}

	// Обновляем рейтинг проекта
	return s.updateProjectRating(ctx, projectID)
}

func (s *ProjectService) updateProjectRating(ctx context.Context, projectID uuid.UUID) error {
	upvotes, err := s.voteRepo.GetProjectVotes(ctx, projectID)
	if err != nil {
		return err
	}

	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return err
	}

	project.Upvotes = upvotes
	project.Rating = upvotes
	project.UpdatedAt = time.Now()

	return s.projectRepo.Update(ctx, project)
}

func (s *ProjectService) GetUserVotes(ctx context.Context, userID uuid.UUID) ([]*entities.Vote, error) {
	return s.voteRepo.GetByUserID(ctx, userID)
}

func (s *ProjectService) GetUserProjects(ctx context.Context, userID uuid.UUID) ([]*entities.Project, error) {
	return s.projectRepo.GetByUserID(ctx, userID)
}
