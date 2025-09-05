package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	Auth     AuthConfig
	Logger   LoggerConfig
	Storage  StorageConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type AuthConfig struct {
	TelegramBotToken string
	JWTSecret        string
	SessionDuration  time.Duration
}

type LoggerConfig struct {
	Level string
}

type StorageConfig struct {
	Type         string // "local" or "s3"
	LocalPath    string
	MaxFileSize  int64 // in bytes
	AllowedTypes []string
	BaseURL      string
}

func Load() *Config {
	if err := godotenv.Load(".env"); err != nil {
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env file not found or could not be loaded: %v", err)
		}
	}

	return &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  getDurationEnv("SERVER_READ_TIMEOUT", 30*time.Second),
			WriteTimeout: getDurationEnv("SERVER_WRITE_TIMEOUT", 30*time.Second),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			DBName:   getEnv("DB_NAME", "startup_scout"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getIntEnv("REDIS_DB", 0),
		},
		Auth: AuthConfig{
			TelegramBotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
			JWTSecret:        getEnv("JWT_SECRET", "your-secret-key"),
			SessionDuration:  getDurationEnv("SESSION_DURATION", 24*time.Hour),
		},
		Logger: LoggerConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
		Storage: StorageConfig{
			Type:         getEnv("STORAGE_TYPE", "local"),
			LocalPath:    getEnv("STORAGE_LOCAL_PATH", "./uploads"),
			MaxFileSize:  getInt64Env("STORAGE_MAX_FILE_SIZE", 10*1024*1024), // 10MB
			AllowedTypes: []string{"image/jpeg", "image/png", "image/gif", "image/webp"},
			BaseURL:      getEnv("STORAGE_BASE_URL", "http://localhost:8080/images"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getInt64Env(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}
