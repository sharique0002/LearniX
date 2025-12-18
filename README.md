# LearniX - AI-Powered EdTech Platform

A scalable, AI-augmented learning management system designed for long-term growth.

## 🚀 Features

- **AI-Powered Tutoring** - Context-aware chatbot that helps learners understand concepts
- **Personalized Recommendations** - ML-based course suggestions using embeddings
- **Gamification** - Streaks, badges, XP, and leaderboards
- **Progress Tracking** - Detailed lesson-by-lesson progress with auto-calculated completions
- **Modern UI** - Beautiful Next.js frontend with Framer Motion animations

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Node.js API   │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Express)     │     │   (Structured)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   AI Service    │────▶│    MongoDB      │
                        │   (FastAPI)     │     │   (Events/Logs) │
                        └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     Redis       │
                        │   (Caching)     │
                        └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TailwindCSS, Framer Motion |
| Backend API | Node.js, Express, PostgreSQL |
| AI Service | Python, FastAPI, OpenAI API |
| Databases | PostgreSQL, MongoDB, Redis |
| Infrastructure | Docker, GitHub Actions |

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL, MongoDB, Redis (or use Docker)

### 1. Start Databases
```bash
docker-compose up -d postgres mongodb redis
```

### 2. Setup Backend API
```bash
cd backend/api
cp .env.example .env
# Edit .env with your secrets
npm install
npm run dev
```

### 3. Setup AI Service
```bash
cd backend/ai-service
cp .env.example .env
# Add your OPENAI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Run Database Migrations
```bash
# Connect to PostgreSQL and run:
psql -d learnix -f database/migrations/001_auth_tables.sql
psql -d learnix -f database/migrations/002_courses_tables.sql
psql -d learnix -f database/migrations/003_gamification_tables.sql
```

## 🔧 Environment Variables

### Backend API (.env)
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/learnix
MONGODB_URI=mongodb://localhost:27017/learnix
JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
FRONTEND_URL=http://localhost:3000
```

### AI Service (.env)
```env
PORT=5000
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb://localhost:27017/learnix
REDIS_URL=redis://localhost:6379
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (instructor)
- `PUT /courses/:id` - Update course
- `POST /courses/:id/modules` - Add module
- `POST /modules/:id/lessons` - Add lesson

### Enrollments
- `POST /enrollments/:courseId` - Enroll in course
- `GET /enrollments` - Get user's enrollments
- `POST /enrollments/progress/lessons/:id/complete` - Mark lesson complete

### Gamification
- `GET /gamification/stats` - Get user stats
- `GET /gamification/badges` - Get user badges
- `GET /gamification/leaderboard` - Get leaderboard

### AI Service
- `POST /chat/sessions/:userId/start` - Start chat session
- `POST /chat/sessions/:sessionId/message/:userId` - Send message
- `GET /recommendations/courses/:userId` - Get recommendations

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
learnix/
├── backend/
│   ├── api/                 # Node.js Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   └── Dockerfile
│   └── ai-service/          # Python FastAPI
│       ├── routers/
│       ├── services/
│       └── Dockerfile
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── stores/
│   └── Dockerfile
├── database/
│   └── migrations/
├── docker-compose.yml
└── .github/workflows/
```

## 🧪 Testing

```bash
# Backend API tests
cd backend/api && npm test

# AI Service tests
cd backend/ai-service && pytest
```

## 📄 License

MIT License
