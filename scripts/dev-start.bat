@echo off
REM LearniX Development Start Script for Windows

echo 🚀 Starting LearniX Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo 📦 Starting databases (PostgreSQL, MongoDB, Redis)...
docker-compose up -d postgres mongodb redis

echo ⏳ Waiting for databases to be ready...
timeout /t 5 /nobreak >nul

echo.
echo 🎯 Development environment ready!
echo.
echo To start the API:          cd backend\api ^&^& npm run dev
echo To start the AI Service:   cd backend\ai-service ^&^& uvicorn main:app --reload
echo To start the Frontend:     cd frontend ^&^& npm run dev
echo.
echo Or run all services:       docker-compose up
echo.
