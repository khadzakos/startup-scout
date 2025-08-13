package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"startup-scout/config"
	"startup-scout/internal/api"
	"startup-scout/internal/infrastructure"
	"startup-scout/internal/services"
	"startup-scout/pkg/clients"

	"github.com/go-chi/jwtauth/v5"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()

	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	logger.Info("Starting application")

	jwtAuth := jwtauth.New("HS256", []byte(cfg.Auth.JWTSecret), nil)

	db, err := clients.NewPostgresClient(&cfg.Database, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	// userRepo := infrastructure.NewUserRepository(db)
	projectRepo := infrastructure.NewProjectRepository(db)
	voteRepo := infrastructure.NewVoteRepository(db)
	launchRepo := infrastructure.NewLaunchRepository(db)
	// commentRepo := infrastructure.NewCommentRepository(db)

	// Инициализируем сервисы
	authService := services.NewAuthService(nil, services.AuthConfig{
		TelegramBotToken:   cfg.Auth.TelegramBotToken,
		YandexClientID:     cfg.Auth.YandexClientID,
		YandexClientSecret: cfg.Auth.YandexClientSecret,
		JWTSecret:          cfg.Auth.JWTSecret,
		SessionDuration:    cfg.Auth.SessionDuration,
	})

	projectService := services.NewProjectService(projectRepo, voteRepo, launchRepo)

	handlers := api.NewHandlers(projectService, authService, logger, jwtAuth)

	router := api.SetupRoutes(handlers, jwtAuth)

	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	go func() {
		logger.Info("Starting HTTP server", zap.String("port", cfg.Server.Port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}
