package services

import (
	"context"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"

	"github.com/google/uuid"
)

type LaunchService struct {
	launchRepo repository.LaunchRepository
}

func NewLaunchService(launchRepo repository.LaunchRepository) *LaunchService {
	return &LaunchService{
		launchRepo: launchRepo,
	}
}

func (s *LaunchService) GetActive(ctx context.Context) (*entities.Launch, error) {
	return s.launchRepo.GetActive(ctx)
}

func (s *LaunchService) Create(ctx context.Context, launch *entities.Launch) error {
	return s.launchRepo.Create(ctx, launch)
}

func (s *LaunchService) GetByID(ctx context.Context, id uuid.UUID) (*entities.Launch, error) {
	return s.launchRepo.GetByID(ctx, id)
}

func (s *LaunchService) GetAll(ctx context.Context) ([]*entities.Launch, error) {
	return s.launchRepo.GetAll(ctx)
}

func (s *LaunchService) Update(ctx context.Context, launch *entities.Launch) error {
	return s.launchRepo.Update(ctx, launch)
}

func (s *LaunchService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.launchRepo.Delete(ctx, id)
}
