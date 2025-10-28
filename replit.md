# Rehber360 - Student Guidance System

## Overview
Rehber360 is a comprehensive Turkish-language student guidance and management system for educational institutions. It offers tools for student tracking, counseling, risk assessment, behavioral monitoring, and academic performance analysis. A core feature is its AI-powered profile analysis, which generates standardized student profiles from diverse data. The system includes an AI Assistant for local, AI-powered student counseling, supporting OpenAI and Ollama (Llama 3.1) models. Built as a full-stack TypeScript application with React, Express.js, and SQLite, Rehber360 aims to drive data standardization and evidence-based interventions for student success.

## Recent Changes
**Date: October 28, 2025**
- Imported GitHub repository into Replit environment
- Configured development workflow with Vite dev server on port 5000
- Database automatically initialized with demo user (rehber@okul.edu.tr / demo)
- All 71 career profiles seeded successfully
- Background schedulers configured (analytics, auto-complete, daily action plans)
- Deployment configuration set up for production (VM target with build and start scripts)
- AI Provider initialized with Ollama (llama3 model)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack:** React 18, TypeScript, Vite, Radix UI, Tailwind CSS, TanStack React Query, React Hook Form + Zod, React Router DOM, Framer Motion, Recharts.
- **Key Decisions:** Feature-based organization with lazy loading, global error boundaries, mobile-first and accessible design (WCAG AAA), React Query for server state, Context API for authentication, and performance optimizations.
- **UI/UX Decisions:** Modern SIS (Student Information System) standards, enhanced visual hierarchy with text-3xl headers, gradient backgrounds, modernized badges, hover effects, and animations. Responsive design with breakpoint-optimized font sizes and flexible layouts. Semantic color system for navigation.
- **Technical Implementations:** Component architecture follows modern best practices with separation of concerns. Proper props flow (studentId, studentName, onUpdate) across components. Grid systems configured for responsive layouts. Loading states and error handling implemented.

### Backend
- **Technology Stack:** Express.js v5, SQLite with `better-sqlite3`, TypeScript, Zod, Multer.
- **Key Decisions:** Modular architecture, Repository Pattern for data access, Service Layer for business logic, shared type safety, robust security (input sanitization, prepared statements, CORS, rate limiting), file upload validation, and centralized error handling with transaction support.
- **Core Features:** Students, Surveys (with Excel bulk upload), Academic Data, Student Support, Administrative Functions, and AI features (holistic-profile, standardized-profile, student-profile-ai, ai-assistant, profile-sync).
- **Feature Specifications:**
    - **Excel Bulk Upload for Survey Responses:** Drag-and-drop, validation preview, server-side parsing, transaction support for atomic batch inserts, detailed row-level error reporting.
    - **Student Management:** StatsCards, AdvancedFilters, BulkActions, EnhancedStudentTable, export functionality (PDF, Excel, CSV), sortable columns, column visibility, compact view, sticky header, responsive mobile card view, student quick preview drawer.
    - **Exam Management:** UnifiedAnalysisTab (consolidates Statistics, Comparison, Trend Analysis), QuickActionsPanel on Dashboard, AdvancedAnalyticsTab with accordion groups.

### Data Architecture
- **Database:** Normalized relational schema in `database.db` for student profiles, behavior, attendance, surveys, counseling, and interventions.
- **Data Standardization:** Comprehensive taxonomy (`shared/constants/student-profile-taxonomy.ts`) for consistent values across academic, social-emotional, and behavioral data, enabling deterministic AI analysis.

### AI and Analytics System
- **AI Suggestion Queue System:** User-approval-required AI recommendation system for profile updates, insights, and interventions with reasoning, confidence, and priority.
- **Living Student Profile:** AI-powered profile aggregation from diverse data sources to generate user-approvable profile update suggestions.
- **AI Assistant:** Professional virtual guidance counselor with psychological and pedagogical expertise, offering pattern recognition, insights, and evidence-based recommendations. Supports OpenAI, Ollama, and Gemini.
- **Advanced AI Features:** Daily Insights, Psychological Depth Analysis, Predictive Risk Timeline, Hourly Action Planner, Student Timeline Analyzer, Comparative Multi-Student Analysis, Notification & Automation, Deep Analysis Engine, Smart Recommendation Engine, Meeting Prep Assistant, AI Dashboard, Unified Scoring Engine, Deterministic Profile Analysis, Early Warning System, and Analytics Caching.
- **Voice Transcription & AI Analysis:** Provider-aware STT (Gemini, OpenAI Whisper, Web Speech API) with AI-powered analysis for auto-summary, keyword extraction, sentiment analysis, and risk word flagging.
- **Enhanced Text Input:** `EnhancedTextarea` with integrated voice input and Gemini-powered text enhancement.

### Authentication and Authorization
- **Role-Based Access Control (RBAC):** Four roles (Admin, Counselor, Teacher, Observer) with hierarchical permissions.
- **Security:** Password hashing (bcryptjs), session-based authentication, and permission guards.

### Build and Deployment
- **Build Process:** Two-stage build (client and server) using Vite.
- **Deployment Target:** Replit VM, running `dist/server/production.mjs` on port 3000.
- **Database:** File-based SQLite (`database.db`) with automatic backups and schema migrations.

## External Dependencies

### Core Runtime
- **Frontend:** `react`, `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-virtual`, Radix UI.
- **Backend:** `express`, `better-sqlite3`, `bcryptjs`, `cors`, `dotenv`.
- **Shared:** `zod`, `xlsx`, `jspdf`.

### Third-Party Services
- **Gemini API:** Primary AI provider.
- **OpenAI API:** Optional integration for AI features.
- **Ollama:** Recommended for local, privacy-focused AI.

### Database
- **SQLite Database:** `database.db` (root directory) using `better-sqlite3` driver.