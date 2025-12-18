#!/bin/bash

# LearniX Development Start Script

echo "🚀 Starting LearniX Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Starting databases (PostgreSQL, MongoDB, Redis)..."
docker-compose up -d postgres mongodb redis

echo "⏳ Waiting for databases to be ready..."
sleep 5

# Check PostgreSQL
until docker-compose exec -T postgres pg_isready -U learnix -d learnix > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL ready"

echo ""
echo "🎯 Development environment ready!"
echo ""
echo "To start the API:          cd backend/api && npm run dev"
echo "To start the AI Service:   cd backend/ai-service && uvicorn main:app --reload"
echo "To start the Frontend:     cd frontend && npm run dev"
echo ""
echo "Or run all services:       docker-compose up"
echo ""
