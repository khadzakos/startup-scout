package main

import (
	"context"
	"flag"
	"log"
	"os"
	"startup-scout/config"
	"startup-scout/internal/infrastructure"
	"startup-scout/internal/services"
	"startup-scout/pkg/clients"

	"go.uber.org/zap"
)

func main() {
	var configPath = flag.String("config", "config/config.yaml", "Path to config file")
	flag.Parse()

	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	db, err := clients.NewPostgresClient(&cfg.Database, logger)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	launchRepo := infrastructure.NewLaunchRepository(db)
	launchService := services.NewLaunchService(launchRepo)

	ctx := context.Background()

	launch, err := launchService.EnsureActiveLaunch(ctx)
	if err != nil {
		logger.Error("Failed to ensure active launch", zap.Error(err))
		os.Exit(1)
	}

	logger.Info("Weekly launch created successfully", 
		zap.String("launch_id", launch.ID.String()),
		zap.String("launch_name", launch.Name),
		zap.Time("start_date", launch.StartDate),
		zap.Time("end_date", launch.EndDate))
}
