# Database configuration - can be overridden with environment variables
DB_HOST ?= $(shell echo $${DB_HOST:-localhost})
DB_PORT ?= $(shell echo $${DB_PORT:-5432})
DB_USER ?= $(shell echo $${DB_USER:-postgres})
DB_PASSWORD ?= $(shell echo $${DB_PASSWORD:-password})
DB_NAME ?= $(shell echo $${DB_NAME:-startup_scout})
DB_SSLMODE ?= $(shell echo $${DB_SSLMODE:-disable})

# Migration files directory
MIGRATIONS_DIR = migrations
MIGRATE_SCRIPT = scripts/migrate.sh

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  migrate-up    - Apply all pending migrations (with tracking)"
	@echo "  migrate-status - Show migration status"
	@echo "  migrate-reset - Reset migrations table"
	@echo "  migrate-simple - Apply migrations without tracking (legacy)"
	@echo "  db-create     - Create database"
	@echo "  db-drop       - Drop database"
	@echo "  db-test       - Test database connection"
	@echo "  db-info       - Show database configuration"
	@echo "  dev-setup     - Setup development environment"
	@echo "  dev-clean     - Clean development environment"
	@echo "  fixtures-load - Load test fixtures"
	@echo "  fixtures-clear - Clear test fixtures"
	@echo "  test-data     - Load test data (migrate + fixtures)"
	@echo ""
	@echo "Environment variables:"
	@echo "  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSLMODE"

# Database connection string
DB_URL = postgresql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)

.PHONY: create-database
create-database:
	@echo "Creating database $(DB_NAME)..."
	@PGPASSWORD=$(DB_PASSWORD) createdb -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) $(DB_NAME) 2>/dev/null || echo "Database $(DB_NAME) already exists or creation failed"

# Apply migrations with tracking (recommended)
.PHONY: migrate-up
migrate-up:
	@echo "Applying migrations with tracking..."
	@$(MIGRATE_SCRIPT) up

# Show migration status
.PHONY: migrate-status
migrate-status:
	@$(MIGRATE_SCRIPT) status

# Reset migrations table
.PHONY: migrate-reset
migrate-reset:
	@$(MIGRATE_SCRIPT) reset

# Create database
.PHONY: db-create
db-create:
	@echo "Creating database $(DB_NAME)..."
	@PGPASSWORD=$(DB_PASSWORD) createdb -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) $(DB_NAME) 2>/dev/null || echo "Database $(DB_NAME) already exists or creation failed"

# Drop database
.PHONY: db-drop
db-drop:
	@echo "Dropping database $(DB_NAME)..."
	@PGPASSWORD=$(DB_PASSWORD) dropdb -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) $(DB_NAME) 2>/dev/null || echo "Database $(DB_NAME) does not exist or drop failed"

# Test database connection
.PHONY: db-test
db-test:
	@echo "Testing database connection..."
	@PGPASSWORD=$(DB_PASSWORD) psql -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) -c "SELECT version();" || echo "Database connection failed"

# Show database info
.PHONY: db-info
db-info:
	@echo "Database configuration:"
	@echo "  Host: $(DB_HOST)"
	@echo "  Port: $(DB_PORT)"
	@echo "  User: $(DB_USER)"
	@echo "  Database: $(DB_NAME)"
	@echo "  SSL Mode: $(DB_SSLMODE)"
	@echo "  Connection URL: $(DB_URL)"

# Development helpers
.PHONY: dev-setup
dev-setup: db-create migrate-up
	@echo "✓ Development environment setup completed!"

.PHONY: dev-clean
dev-clean: db-drop
	@echo "✓ Development environment cleaned!"

# Full reset (database + migrations)
.PHONY: dev-reset
dev-reset: db-drop db-create migrate-up
	@echo "✓ Full development environment reset completed!"

# Fixtures management
.PHONY: fixtures-load
fixtures-load:
	@echo "Loading test fixtures..."
	@chmod +x scripts/load_fixtures.sh
	@./scripts/load_fixtures.sh $(DB_NAME)

.PHONY: fixtures-clear
fixtures-clear:
	@echo "Clearing test fixtures..."
	@PGPASSWORD=$(DB_PASSWORD) psql -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) -c "TRUNCATE TABLE votes, comments, projects, launches, users CASCADE;"

.PHONY: test-data
test-data: migrate-up fixtures-load
	@echo "✓ Test data loaded successfully!"
