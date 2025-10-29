# Setup Guide

Complete setup instructions for Rehber360 development environment.

## 📋 Prerequisites

### Required Software

- **Node.js**: v20.x or later
- **npm**: v9.x or later (comes with Node.js)
- **Git**: Latest version

### Optional (Recommended)

- **AI Providers** (at least one):
  - OpenAI API key (for GPT-4o/GPT-4o-mini)
  - Gemini API key (for Gemini 1.5 Flash)
  - Ollama (local LLM - no API key needed)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/rehber360.git
cd rehber360
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies for both client and server.

### 3. Environment Setup

Create `.env` file in the root directory:

```bash
touch .env
```

Add the following variables:

```env
# Database
DATABASE_PATH=./database.db

# Session Secret (generate random string)
SESSION_SECRET=your-secret-key-here-change-this

# AI Providers (at least one recommended)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Encryption (for backups)
ENCRYPTION_KEY=your-32-character-encryption-key

# Server
PORT=5000
NODE_ENV=development
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Generate ENCRYPTION_KEY:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Initialize Database

The database will be automatically created on first run. To seed with demo data:

```bash
npm run seed
```

This creates:
- Demo admin user: `demo@rehber360.com` / `demo`
- 50 sample students
- Sample exam results
- Sample counseling sessions

### 5. Start Development Server

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api

**First Login:**
```
Email: demo@rehber360.com
Password: demo
```

---

## 🔧 Detailed Configuration

### Database Configuration

SQLite database is created at `./database.db` by default.

**Custom location:**
```env
DATABASE_PATH=/path/to/custom/database.db
```

**Database settings** in `server/lib/database/connection.ts`:
```typescript
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -16000'); // 16 MB
```

### AI Provider Setup

#### Option 1: Gemini (Recommended for Free Tier)

1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `.env`:
```env
GEMINI_API_KEY=your-key-here
```

#### Option 2: OpenAI

1. Get API key: https://platform.openai.com/api-keys
2. Add to `.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

#### Option 3: Ollama (Local, Free)

1. Install Ollama: https://ollama.ai
2. Pull model:
```bash
ollama pull llama3.1
```
3. Start Ollama service:
```bash
ollama serve
```
4. No API key needed in `.env`

### File Upload Configuration

**Upload limits** in `server/middleware/file-validation.middleware.ts`:
```typescript
limits: {
  fileSize: 10 * 1024 * 1024 // 10 MB max
}
```

**Allowed file types:**
- Documents: PDF, DOCX, TXT
- Spreadsheets: XLSX, CSV
- Images: JPG, PNG (profile pictures)

---

## 🗄️ Database Schema

Database is automatically created with 40+ tables on first run.

**Core tables:**
- `students`: Student records
- `exam_results`: Exam scores
- `counseling_sessions`: Counseling records
- `survey_templates`, `survey_distributions`, `survey_responses`: Survey system
- `ai_suggestions`: AI-generated profile updates
- `users`: System users

**View schema:**
```bash
sqlite3 database.db .schema
```

---

## 👥 User Roles

Four role types with different permissions:

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| **Admin** | Full system access | All CRUD operations, user management, system settings |
| **Counselor** | Primary user role | Student management, counseling, surveys, AI features |
| **Teacher** | Limited educator access | View students, view analytics, limited updates |
| **Observer** | Read-only access | View-only access to students and reports |

**Create first admin:**

First user registered automatically becomes admin. After that, use admin panel to create additional users.

---

## 🧪 Testing Setup

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### Test Database

Tests use an in-memory SQLite database (`:memory:`), not the development database.

---

## 🐛 Troubleshooting

### Database locked

**Error:** `database is locked`

**Solution:** Close other SQLite connections, or restart the server.

### Port already in use

**Error:** `EADDRINUSE: address already in use`

**Solution:** Change port in `.env` or kill process using port 5000:
```bash
lsof -ti:5000 | xargs kill -9
```

### AI API errors

**Error:** `Invalid API key`

**Solution:** Check API key is correct in `.env` and restart server.

### Build errors

**Error:** TypeScript compilation errors

**Solution:**
```bash
# Clean build artifacts
rm -rf dist/
npm run build
```

### SQLite not found

**Error:** `Module not found: better-sqlite3`

**Solution:** Rebuild native modules:
```bash
npm rebuild better-sqlite3
```

---

## 🔄 Update Guide

### Pull Latest Changes

```bash
git pull origin main
npm install  # Update dependencies
npm run build  # Rebuild
```

### Database Migrations

If schema changes are needed, migrations run automatically on server start.

**Manual migration:**
```bash
npm run migrate
```

---

## 📚 Next Steps

- **Development**: See [Development Guide](./development.md)
- **Deployment**: See [Deployment Guide](./deployment.md)
- **Testing**: See [Testing Guide](./testing.md)
- **Contributing**: See [Contributing Guide](./contributing.md)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Can access http://localhost:5000
- [ ] Can login with demo credentials
- [ ] Database file created (`database.db`)
- [ ] No console errors in browser
- [ ] AI features work (if API keys configured)

---

**Last Updated:** October 29, 2025  
**For Help:** Check [Troubleshooting](#troubleshooting) or create an issue
