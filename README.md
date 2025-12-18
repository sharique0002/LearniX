# 🎓 LearniX - AI-Powered EdTech Platform

<div align="center">

![LearniX](https://img.shields.io/badge/LearniX-EdTech%20Platform-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.1.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)

**A scalable, AI-augmented learning management system designed for modern education**

**🚀 New in v1.1: CourseCard, ProgressBar, and Badge components with animations!**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Running with Docker](#-running-with-docker)
- [Manual Setup](#-manual-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Gamification System](#-gamification-system)
- [AI Features](#-ai-features)
- [Management Guide](#-management-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🚀 Features

### Core Learning Features
- **📚 Course Management** - Create, organize, and manage courses with modules and lessons
- **📈 Progress Tracking** - Detailed lesson-by-lesson progress with auto-calculated completions
- **🎯 Enrollment System** - User enrollment with progress persistence

### AI-Powered Features
- **🤖 AI Tutor Chatbot** - Context-aware chatbot that helps learners understand concepts
- **💡 Personalized Recommendations** - ML-based course suggestions using OpenAI embeddings
- **📊 Learning Analytics** - Track and analyze learning patterns

### Gamification
- **🔥 Streaks** - Daily learning streaks with rewards
- **🏆 Badges** - Achievement badges for milestones
- **⭐ XP System** - Experience points for activities
- **📊 Leaderboards** - Weekly and monthly rankings

### Technical Features
- **🔐 JWT Authentication** - Secure access & refresh token system
- **🛡️ Role-Based Access** - Admin, Instructor, and Learner roles
- **🚦 Rate Limiting** - API protection against abuse
- **📦 Redis Caching** - High-performance caching layer
- **🎨 Modern UI** - React frontend with Tailwind CSS and Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite 6** | Build Tool & Dev Server |
| **TailwindCSS** | Styling |
| **Framer Motion** | Animations |
| **React Router 7** | Navigation |
| **Zustand** | State Management |
| **TanStack Query** | Server State & Caching |
| **Axios** | HTTP Client |

### Backend API (Node.js)
| Technology | Purpose |
|------------|---------|
| **Node.js 20+** | Runtime |
| **Express 4** | Web Framework |
| **PostgreSQL** | Primary Database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |
| **Helmet** | Security Headers |
| **express-rate-limit** | Rate Limiting |

### AI Service (Python)
| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Runtime |
| **FastAPI** | Web Framework |
| **OpenAI API** | GPT & Embeddings |
| **sentence-transformers** | Local Embeddings |
| **MongoDB** | Event Storage |
| **Redis** | Caching |
| **NumPy** | Vector Operations |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container Orchestration |
| **PostgreSQL 15** | Relational Data |
| **MongoDB 7** | Event Logs & Chat History |
| **Redis 7** | Caching & Sessions |
| **GitHub Actions** | CI/CD |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                    React + Vite + TailwindCSS                       │
│                         Port: 3000                                   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
├─────────────────────────────┬───────────────────────────────────────┤
│                             │                                        │
│  ┌──────────────────┐       │       ┌──────────────────┐            │
│  │   Node.js API    │       │       │   AI Service     │            │
│  │    (Express)     │◄──────┼──────►│   (FastAPI)      │            │
│  │    Port: 4000    │       │       │    Port: 5000    │            │
│  └────────┬─────────┘       │       └────────┬─────────┘            │
│           │                 │                │                       │
└───────────┼─────────────────┼────────────────┼───────────────────────┘
            │                 │                │
            ▼                 ▼                ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────┐
│   PostgreSQL      │ │   MongoDB     │ │    Redis      │
│   (Primary DB)    │ │  (Events/     │ │   (Cache)     │
│   Port: 5432      │ │   Chat Logs)  │ │   Port: 6379  │
│                   │ │   Port: 27017 │ │               │
└───────────────────┘ └───────────────┘ └───────────────┘
```

### Data Flow

1. **User Authentication**: Frontend → Node.js API → PostgreSQL
2. **Course Operations**: Frontend → Node.js API → PostgreSQL
3. **AI Chat**: Frontend → AI Service → OpenAI API → MongoDB (logs)
4. **Recommendations**: AI Service → MongoDB (activity) → OpenAI Embeddings → Redis (cache)
5. **Gamification**: Node.js API → PostgreSQL + MongoDB (events)

---

## 📁 Project Structure

```
LearniX/
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (routes)
│   │   ├── stores/             # Zustand state stores
│   │   ├── lib/                # Utilities and API client
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── api/                    # Node.js REST API
│   │   ├── src/
│   │   │   ├── config/         # Database connections
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── middleware/     # Auth, validation
│   │   │   ├── models/         # MongoDB models
│   │   │   ├── routes/         # API route definitions
│   │   │   ├── services/       # Business logic
│   │   │   ├── utils/          # Helpers (JWT, slugify)
│   │   │   └── app.js          # Express app entry
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── ai-service/             # Python AI Service
│       ├── config/             # Settings & database
│       ├── routers/            # FastAPI route handlers
│       ├── services/           # AI logic (chatbot, recommendations)
│       ├── main.py             # FastAPI app entry
│       ├── requirements.txt
│       └── Dockerfile
│
├── database/
│   └── migrations/             # SQL migration files
│       ├── 001_auth_tables.sql
│       ├── 002_courses_tables.sql
│       └── 003_gamification_tables.sql
│
├── scripts/
│   ├── dev-start.bat           # Windows development script
│   └── dev-start.sh            # Linux/Mac development script
│
├── docker-compose.yml          # Full stack Docker setup
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://python.org/))
- **Docker** & Docker Compose ([Download](https://docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/sharique0002/LearniX.git
cd LearniX

# Create environment file
cp backend/api/.env.example backend/api/.env
cp backend/ai-service/.env.example backend/ai-service/.env

# Edit .env files and add your OPENAI_API_KEY

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost:3000
- Node.js API: http://localhost:4000
- AI Service: http://localhost:5000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

### Option 2: Manual Setup

See [Manual Setup](#-manual-setup) section below.

---

## 🐳 Running with Docker

### Start All Services

```bash
# Start everything (databases + services)
docker-compose up -d

# Start only databases
docker-compose up -d postgres mongodb redis

# Rebuild after code changes
docker-compose up -d --build
```

### Managing Containers

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f ai-service

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart a specific service
docker-compose restart api
```

### Docker Services Overview

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| api | learnix-api | 4000 | Node.js REST API |
| ai-service | learnix-ai | 5000 | Python AI Service |
| postgres | learnix-postgres | 5432 | PostgreSQL Database |
| mongodb | learnix-mongodb | 27017 | MongoDB Database |
| redis | learnix-redis | 6379 | Redis Cache |

---

## 🔧 Manual Setup

### 1. Start Databases

```bash
# Using Docker for databases only
docker-compose up -d postgres mongodb redis
```

Or install PostgreSQL, MongoDB, and Redis locally.

### 2. Setup Backend API

```bash
cd backend/api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Then start the server
npm run dev
```

### 3. Setup AI Service

```bash
cd backend/ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your OPENAI_API_KEY
# Then start the server
uvicorn main:app --reload --port 5000
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Run Database Migrations

```bash
# Connect to PostgreSQL and run migrations
psql -h localhost -U learnix -d learnix -f database/migrations/001_auth_tables.sql
psql -h localhost -U learnix -d learnix -f database/migrations/002_courses_tables.sql
psql -h localhost -U learnix -d learnix -f database/migrations/003_gamification_tables.sql
```

Or if using Docker:
```bash
docker exec -i learnix-postgres psql -U learnix -d learnix < database/migrations/001_auth_tables.sql
docker exec -i learnix-postgres psql -U learnix -d learnix < database/migrations/002_courses_tables.sql
docker exec -i learnix-postgres psql -U learnix -d learnix < database/migrations/003_gamification_tables.sql
```

---

## 🔐 Environment Variables

### Backend API (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# PostgreSQL Database
DATABASE_URL=postgresql://learnix:learnix_password@localhost:5432/learnix

# MongoDB
MONGODB_URI=mongodb://localhost:27017/learnix

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (use strong random strings in production)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### AI Service (.env)

```env
# Server
PORT=5000
DEBUG=true

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/learnix

# Redis
REDIS_URL=redis://localhost:6379

# API URL (Node.js backend)
API_URL=http://localhost:4000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/logout` | Logout and invalidate session |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user profile |

#### Register User
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List all courses |
| GET | `/courses/:slug` | Get course by slug |
| POST | `/courses` | Create course (admin/instructor) |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |
| GET | `/courses/:id/lessons` | Get course lessons |

### Enrollment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/enrollments` | Enroll in course |
| GET | `/enrollments` | Get user enrollments |
| PUT | `/enrollments/:id/progress` | Update progress |
| GET | `/enrollments/:courseId/progress` | Get course progress |

### Gamification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gamification/profile` | Get gamification profile |
| GET | `/gamification/badges` | Get user badges |
| GET | `/gamification/leaderboard` | Get leaderboard |
| GET | `/gamification/streak` | Get streak info |

### AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/start` | Start chat session |
| POST | `/chat/message` | Send message to AI tutor |
| GET | `/chat/history/:sessionId` | Get chat history |
| GET | `/recommendations` | Get personalized recommendations |
| POST | `/recommendations/log` | Log user activity |
| GET | `/analytics/dashboard` | Get learning analytics |

#### Chat with AI Tutor
```bash
# Start session
curl -X POST http://localhost:5000/chat/start \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "lessonId": "lesson-id"}'

# Send message
curl -X POST http://localhost:5000/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-id",
    "message": "Can you explain this concept?"
  }'
```

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### Users & Authentication
- **users** - User accounts (email, password_hash, role)
- **roles** - Role definitions (admin, instructor, learner)
- **sessions** - Refresh token sessions

#### Courses
- **courses** - Course metadata
- **modules** - Course modules/sections
- **lessons** - Individual lessons
- **enrollments** - User course enrollments
- **lesson_progress** - Per-lesson completion tracking

#### Gamification
- **badges** - Badge definitions
- **user_badges** - Earned badges
- **user_streaks** - Streak tracking with XP
- **leaderboard** - Weekly/monthly rankings

### MongoDB Collections

- **activity_events** - User activity logs
- **chat_sessions** - AI chat sessions
- **chat_messages** - Chat message history
- **embeddings_cache** - Cached vector embeddings

---

## 🎮 Gamification System

### XP (Experience Points)

| Activity | XP Earned |
|----------|-----------|
| Complete lesson | 10 XP |
| Complete course | 100 XP |
| Pass quiz | 25 XP |
| Daily login streak | 5 XP |
| Ask AI tutor | 2 XP |

### Badges

| Badge | Requirement | Points |
|-------|-------------|--------|
| 🎯 First Steps | Complete first lesson | 10 |
| 🏆 Course Champion | Complete first course | 100 |
| 🔥 Week Warrior | 7-day streak | 50 |
| 🌟 Month Master | 30-day streak | 200 |
| ⚡ Fast Learner | 5 lessons in one day | 30 |
| 🧠 Knowledge Seeker | Ask 10 AI questions | 25 |
| 🚀 Early Adopter | First 1000 users | 500 |

### Streak System

- Streaks increase for consecutive daily learning
- Missing a day resets the streak
- Streak milestones unlock badges
- Longest streak is recorded

### Leaderboard

- Weekly rankings reset every Monday
- Monthly rankings reset on the 1st
- Rankings based on XP earned in period

---

## 🤖 AI Features

### AI Tutor Chatbot

The AI tutor uses OpenAI's GPT model to provide personalized learning assistance:

- **Context-Aware**: Knows what lesson you're studying
- **Adaptive**: Adjusts explanations to your level
- **Encouraging**: Provides positive reinforcement
- **Socratic**: Guides thinking rather than just giving answers

### Personalized Recommendations

Uses embedding-based similarity matching:

1. **User Profile Embedding**: Generated from learning history
2. **Course Embeddings**: Generated from course descriptions
3. **Similarity Matching**: Cosine similarity between user and courses
4. **Personalized Ranking**: Courses ranked by relevance

### Learning Analytics

- Time spent per lesson
- Completion rates
- Learning patterns
- Progress trends

---

## 🛠️ Management Guide

### Adding New Courses

1. **Via API** (Admin/Instructor):
```bash
curl -X POST http://localhost:4000/courses \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python programming from scratch",
    "thumbnail": "https://example.com/python.jpg",
    "difficulty": "beginner",
    "estimatedHours": 20
  }'
```

2. **Add Modules and Lessons**:
```bash
# Add module
curl -X POST http://localhost:4000/courses/<course_id>/modules \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title": "Getting Started", "order": 1}'

# Add lesson
curl -X POST http://localhost:4000/modules/<module_id>/lessons \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title": "Installing Python", "content": "...", "order": 1}'
```

### User Management

```sql
-- View all users
SELECT id, email, first_name, last_name, role_id, created_at 
FROM users ORDER BY created_at DESC;

-- Promote user to instructor
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'instructor') 
WHERE email = 'user@example.com';

-- Deactivate user
UPDATE users SET is_active = false WHERE email = 'user@example.com';
```

### Database Backup

```bash
# Backup PostgreSQL
docker exec learnix-postgres pg_dump -U learnix learnix > backup.sql

# Restore PostgreSQL
docker exec -i learnix-postgres psql -U learnix learnix < backup.sql

# Backup MongoDB
docker exec learnix-mongodb mongodump --out /data/backup

# Restore MongoDB
docker exec learnix-mongodb mongorestore /data/backup
```

### Monitoring Health

```bash
# Check API health
curl http://localhost:4000/health

# Check AI Service health
curl http://localhost:5000/health

# Check all container status
docker-compose ps

# View resource usage
docker stats
```

---

## ❓ Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart postgres mongodb redis

# View database logs
docker-compose logs postgres
```

#### Port Already in Use
```bash
# Find process using port (Windows)
netstat -ano | findstr :4000

# Kill process (Windows)
taskkill /PID <pid> /F

# Find process using port (Linux/Mac)
lsof -i :4000
kill -9 <pid>
```

#### AI Service Not Working
```bash
# Check if OPENAI_API_KEY is set
cat backend/ai-service/.env | grep OPENAI

# View AI service logs
docker-compose logs ai-service

# Test OpenAI connection
curl http://localhost:5000/health
```

#### Migrations Failed
```bash
# Connect to PostgreSQL container
docker exec -it learnix-postgres psql -U learnix -d learnix

# Check tables
\dt

# Re-run migrations manually
\i /docker-entrypoint-initdb.d/001_auth_tables.sql
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sharique**

- GitHub: [@sharique0002](https://github.com/sharique0002)

---

<div align="center">

**⭐ Star this repo if you find it helpful! ⭐**

Made with ❤️ for better education

</div>
