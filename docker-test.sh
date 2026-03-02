#!/usr/bin/env bash
# Test script to verify Docker setup with shared package

set -euo pipefail

echo "🐳 Testing Docker setup with shared package..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi

success "Docker is running"

# Check if docker-compose is available
if ! command -v docker compose &> /dev/null; then
    error "docker compose is not available"
fi

success "docker compose is available"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        success "Created .env from .env.example"
    else
        error ".env.example not found"
    fi
fi

# Build the services
echo "🔨 Building services..."
if docker compose build web apis; then
    success "Services built successfully"
else
    error "Failed to build services"
fi

# Check if shared package is in the image
echo "🔍 Verifying shared package is included..."
if docker compose run --rm --no-deps web ls -la /app/packages/shared 2>/dev/null | grep -q "package.json"; then
    success "Shared package found in web service"
else
    error "Shared package not found in web service"
fi

if docker compose run --rm --no-deps apis ls -la /app/packages/shared 2>/dev/null | grep -q "package.json"; then
    success "Shared package found in apis service"
else
    error "Shared package not found in apis service"
fi

echo ""
echo "✨ All checks passed! Docker setup is ready."
echo ""
echo "To start all services:"
echo "  docker compose up"
echo ""
echo "To start specific services:"
echo "  docker compose up web apis mongodb"
