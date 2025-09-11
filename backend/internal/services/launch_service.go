package services

import (
	"context"
	"fmt"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"
	"time"

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

// EnsureActiveLaunch проверяет наличие активного запуска и создает новый если нужно
func (s *LaunchService) EnsureActiveLaunch(ctx context.Context) (*entities.Launch, error) {
	// Проверяем, есть ли активный запуск
	activeLaunch, err := s.launchRepo.GetActive(ctx)
	if err == nil && activeLaunch != nil {
		// Проверяем, не истек ли срок действия активного запуска
		if time.Now().Before(activeLaunch.EndDate) {
			return activeLaunch, nil
		}
		
		// Если запуск истек, деактивируем его
		activeLaunch.IsActive = false
		if err := s.launchRepo.Update(ctx, activeLaunch); err != nil {
			return nil, fmt.Errorf("failed to deactivate expired launch: %w", err)
		}
	}

	// Создаем новый запуск
	newLaunch, err := s.CreateNewWeeklyLaunch(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create new launch: %w", err)
	}

	return newLaunch, nil
}

// CreateNewWeeklyLaunch создает новый недельный запуск
func (s *LaunchService) CreateNewWeeklyLaunch(ctx context.Context) (*entities.Launch, error) {
	now := time.Now()

	// Находим следующий понедельник в 00:00
	nextMonday := s.getNextMonday(now)

	// Конец запуска - воскресенье в 23:59:59
	endDate := nextMonday.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	// Генерируем название запуска
	launchName := fmt.Sprintf("Weekly Launch #%d", s.getLaunchNumber(ctx, nextMonday))

	launch := &entities.Launch{
		ID:        uuid.New(),
		Name:      launchName,
		StartDate: nextMonday,
		EndDate:   endDate,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := s.launchRepo.Create(ctx, launch); err != nil {
		return nil, fmt.Errorf("failed to create launch: %w", err)
	}

	return launch, nil
}

// getNextMonday возвращает следующий понедельник в 00:00
func (s *LaunchService) getNextMonday(now time.Time) time.Time {
	// Получаем день недели (0 = воскресенье, 1 = понедельник, ..., 6 = суббота)
	weekday := int(now.Weekday())

	// Если сегодня понедельник и еще рано (до 00:00), то используем текущий понедельник
	// Иначе находим следующий понедельник
	var daysUntilMonday int
	if weekday == 1 { // понедельник
		// Если сегодня понедельник, проверяем время
		// Если уже прошло 00:00, то следующий понедельник через 7 дней
		// Если еще не 00:00, то используем текущий понедельник
		if now.Hour() == 0 && now.Minute() == 0 && now.Second() == 0 {
			daysUntilMonday = 0 // текущий понедельник
		} else {
			daysUntilMonday = 7 // следующий понедельник
		}
	} else if weekday == 0 { // воскресенье
		daysUntilMonday = 1
	} else {
		daysUntilMonday = 8 - weekday
	}

	// Получаем понедельник в 00:00
	monday := now.AddDate(0, 0, daysUntilMonday)
	monday = time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, monday.Location())

	return monday
}

// getLaunchNumber возвращает номер запуска для названия
func (s *LaunchService) getLaunchNumber(ctx context.Context, startDate time.Time) int {
	// Получаем все запуски
	launches, err := s.launchRepo.GetAll(ctx)
	if err != nil {
		return 1 // Если не удалось получить, начинаем с 1
	}

	// Считаем количество запусков, которые начинаются в том же году
	year := startDate.Year()
	count := 1
	for _, launch := range launches {
		if launch.StartDate.Year() == year {
			count++
		}
	}

	return count
}
