#!/bin/bash

# Script to load test fixtures into the database
# Usage: ./load_fixtures.sh [database_name]

set -e

# Default database name
DB_NAME=${1:-startup_scout}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Loading test fixtures into database: $DB_NAME"

docker-compose exec postgres psql -U "$DB_USER" -d "$DB_NAME" -f /testdata/fixtures.sql

echo "Fixtures loaded successfully!"
echo ""
echo "Test data summary:"
echo "- 5 test users"
echo "- 5 test launches (2 active)"
echo "- 8 test projects"
echo "- 24 test votes"
echo "- 12 test comments"
