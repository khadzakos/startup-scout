#!/bin/bash

# Migration script for Startup Scout
# This script tracks executed migrations using a migrations table

set -e

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-startup_scout}
DB_SSLMODE=${DB_SSLMODE:-disable}

MIGRATIONS_DIR="migrations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to execute SQL command
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1" -t -A
}

# Function to check if migrations table exists
check_migrations_table() {
    local table_exists=$(execute_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations');")
    echo $table_exists
}

# Function to create migrations table
create_migrations_table() {
    print_status "Creating migrations table..."
    execute_sql "
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    "
}

# Function to check if migration was executed
is_migration_executed() {
    local filename=$1
    local executed=$(execute_sql "SELECT COUNT(*) FROM migrations WHERE filename = '$filename';")
    echo $executed
}

# Function to mark migration as executed
mark_migration_executed() {
    local filename=$1
    execute_sql "INSERT INTO migrations (filename) VALUES ('$filename');"
}

# Function to apply migrations
apply_migrations() {
    print_status "Checking for pending migrations..."
    
    # Create migrations table if it doesn't exist
    if [ "$(check_migrations_table)" != "t" ]; then
        create_migrations_table
    fi
    
    # Get all SQL files in migrations directory
    local migration_files=$(ls $MIGRATIONS_DIR/*.sql 2>/dev/null | sort)
    
    if [ -z "$migration_files" ]; then
        print_warning "No migration files found in $MIGRATIONS_DIR/"
        return 0
    fi
    
    local applied_count=0
    
    for file in $migration_files; do
        local filename=$(basename "$file")
        
        # Check if migration was already executed
        if [ "$(is_migration_executed "$filename")" = "0" ]; then
            print_status "Applying migration: $filename"
            
            # Execute the migration
            if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" > /dev/null 2>&1; then
                # Mark as executed
                mark_migration_executed "$filename"
                print_status "✓ Migration $filename applied successfully"
                ((applied_count++))
            else
                print_error "✗ Failed to apply migration $filename"
                exit 1
            fi
        else
            print_status "Migration $filename already applied, skipping"
        fi
    done
    
    if [ $applied_count -eq 0 ]; then
        print_status "No new migrations to apply"
    else
        print_status "Applied $applied_count new migration(s)"
    fi
}

# Function to show migration status
show_status() {
    print_status "Migration status:"
    echo
    
    # Check if migrations table exists
    if [ "$(check_migrations_table)" != "t" ]; then
        print_warning "Migrations table does not exist. No migrations have been applied yet."
        return 0
    fi
    
    # Get all migration files
    local migration_files=$(ls $MIGRATIONS_DIR/*.sql 2>/dev/null | sort)
    
    if [ -z "$migration_files" ]; then
        print_warning "No migration files found in $MIGRATIONS_DIR/"
        return 0
    fi
    
    echo "Migration files:"
    for file in $migration_files; do
        local filename=$(basename "$file")
        local executed=$(is_migration_executed "$filename")
        
        if [ "$executed" = "1" ]; then
            echo -e "  ${GREEN}✓${NC} $filename (applied)"
        else
            echo -e "  ${YELLOW}○${NC} $filename (pending)"
        fi
    done
    
    echo
    print_status "Executed migrations:"
    execute_sql "SELECT filename, executed_at FROM migrations ORDER BY executed_at;" | while IFS='|' read -r filename executed_at; do
        echo "  $filename - $executed_at"
    done
}

# Function to reset migrations
reset_migrations() {
    print_warning "This will drop the migrations table and all applied migrations!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping migrations table..."
        execute_sql "DROP TABLE IF EXISTS migrations;"
        print_status "Migrations reset completed"
    else
        print_status "Reset cancelled"
    fi
}

# Main script logic
case "${1:-help}" in
    "up"|"apply")
        apply_migrations
        ;;
    "status")
        show_status
        ;;
    "reset")
        reset_migrations
        ;;
    "help"|*)
        echo "Usage: $0 {up|status|reset|help}"
        echo
        echo "Commands:"
        echo "  up      - Apply pending migrations"
        echo "  status  - Show migration status"
        echo "  reset   - Reset migrations table"
        echo "  help    - Show this help message"
        echo
        echo "Environment variables:"
        echo "  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSLMODE"
        ;;
esac 