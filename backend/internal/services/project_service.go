package services

import (
	"context"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"time"
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
	project.CreatedAt = time.Now()
	project.UpdatedAt = time.Now()
	project.Upvotes = 0
	project.Downvotes = 0
	project.Rating = 0

	return s.projectRepo.Create(ctx, project)
}

func (s *ProjectService) GetProject(ctx context.Context, id int64) (*entities.Project, error) {
	return s.projectRepo.GetByID(ctx, id)
}

func (s *ProjectService) GetProjectsByLaunch(ctx context.Context, launchID int64) ([]*entities.Project, error) {
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

func (s *ProjectService) Vote(ctx context.Context, userID, projectID int64, voteType entities.VoteType) error {
	// Получаем активный запуск
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err != nil {
		return err
	}

	// Проверяем, есть ли уже голос от этого пользователя
	existingVote, err := s.voteRepo.GetByUserAndProject(ctx, userID, projectID, activeLaunch.ID)
	if err == nil && existingVote != nil {
		// Если голос уже есть, обновляем его
		existingVote.VoteType = voteType
		existingVote.CreatedAt = time.Now()
		return s.voteRepo.Update(ctx, existingVote)
	}

	// Создаем новый голос
	vote := &entities.Vote{
		UserID:    userID,
		ProjectID: projectID,
		LaunchID:  activeLaunch.ID,
		VoteType:  voteType,
		CreatedAt: time.Now(),
	}

	if err := s.voteRepo.Create(ctx, vote); err != nil {
		return err
	}

	// Обновляем рейтинг проекта
	return s.updateProjectRating(ctx, projectID)
}

func (s *ProjectService) updateProjectRating(ctx context.Context, projectID int64) error {
	upvotes, downvotes, err := s.voteRepo.GetProjectVotes(ctx, projectID)
	if err != nil {
		return err
	}

	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return err
	}

	project.Upvotes = upvotes
	project.Downvotes = downvotes
	project.Rating = upvotes - downvotes
	project.UpdatedAt = time.Now()

	return s.projectRepo.Update(ctx, project)
}

func (s *ProjectService) GetUserVotes(ctx context.Context, userID int64) ([]*entities.Vote, error) {
	// Этот метод нужно будет реализовать в репозитории
	// Пока возвращаем пустой слайс
	return []*entities.Vote{}, nil
}
