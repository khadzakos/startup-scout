package clients

import (
	"context"
	"fmt"
	"time"

	"startup-scout/config"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

// PostgresClient представляет клиент для работы с PostgreSQL
type PostgresClient struct {
	db     *sqlx.DB
	logger *zap.Logger
}

// NewPostgresClient создает новый экземпляр PostgreSQL клиента
func NewPostgresClient(cfg *config.DatabaseConfig, logger *zap.Logger) (*PostgresClient, error) {
	// Формируем строку подключения
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
	)

	// Подключаемся к базе данных
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Настраиваем пул соединений
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	// Проверяем соединение
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Successfully connected to PostgreSQL database",
		zap.String("host", cfg.Host),
		zap.String("port", cfg.Port),
		zap.String("database", cfg.DBName),
	)

	return &PostgresClient{
		db:     db,
		logger: logger,
	}, nil
}

// Close закрывает соединение с базой данных
func (c *PostgresClient) Close() error {
	if c.db != nil {
		return c.db.Close()
	}
	return nil
}

// GetDB возвращает экземпляр sqlx.DB для прямого доступа
func (c *PostgresClient) GetDB() *sqlx.DB {
	return c.db
}

// Ping проверяет соединение с базой данных
func (c *PostgresClient) Ping(ctx context.Context) error {
	return c.db.PingContext(ctx)
}

// BeginTx начинает транзакцию
func (c *PostgresClient) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return c.db.BeginTxx(ctx, nil)
}

// HealthCheck выполняет проверку здоровья базы данных
func (c *PostgresClient) HealthCheck(ctx context.Context) error {
	// Проверяем соединение
	if err := c.Ping(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	// Проверяем, что можем выполнить простой запрос
	var result int
	if err := c.db.GetContext(ctx, &result, "SELECT 1"); err != nil {
		return fmt.Errorf("database query failed: %w", err)
	}

	return nil
}

// GetStats возвращает статистику пула соединений
func (c *PostgresClient) GetStats() map[string]interface{} {
	stats := c.db.Stats()
	return map[string]interface{}{
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":               stats.InUse,
		"idle":                 stats.Idle,
		"wait_count":           stats.WaitCount,
		"wait_duration":        stats.WaitDuration,
		"max_idle_closed":      stats.MaxIdleClosed,
		"max_lifetime_closed":  stats.MaxLifetimeClosed,
	}
}

// ExecuteMigration выполняет SQL миграцию
func (c *PostgresClient) ExecuteMigration(ctx context.Context, sql string) error {
	_, err := c.db.ExecContext(ctx, sql)
	if err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}
	return nil
}

// CreateMigrationsTable создает таблицу для отслеживания миграций
func (c *PostgresClient) CreateMigrationsTable(ctx context.Context) error {
	sql := `
		CREATE TABLE IF NOT EXISTS migrations (
			id SERIAL PRIMARY KEY,
			filename VARCHAR(255) NOT NULL UNIQUE,
			executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`
	return c.ExecuteMigration(ctx, sql)
}

// IsMigrationExecuted проверяет, была ли миграция уже выполнена
func (c *PostgresClient) IsMigrationExecuted(ctx context.Context, filename string) (bool, error) {
	var count int
	err := c.db.GetContext(ctx, &count,
		"SELECT COUNT(*) FROM migrations WHERE filename = $1", filename)
	if err != nil {
		return false, fmt.Errorf("failed to check migration status: %w", err)
	}
	return count > 0, nil
}

// MarkMigrationExecuted отмечает миграцию как выполненную
func (c *PostgresClient) MarkMigrationExecuted(ctx context.Context, filename string) error {
	_, err := c.db.ExecContext(ctx,
		"INSERT INTO migrations (filename) VALUES ($1)", filename)
	if err != nil {
		return fmt.Errorf("failed to mark migration as executed: %w", err)
	}
	return nil
}

// GetExecutedMigrations возвращает список выполненных миграций
func (c *PostgresClient) GetExecutedMigrations(ctx context.Context) ([]string, error) {
	var filenames []string
	err := c.db.SelectContext(ctx, &filenames,
		"SELECT filename FROM migrations ORDER BY executed_at")
	if err != nil {
		return nil, fmt.Errorf("failed to get executed migrations: %w", err)
	}
	return filenames, nil
}
