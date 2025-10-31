# API Documentation

## 📋 Overview

This directory contains comprehensive API documentation for all Rehber360 endpoints. Each file documents a specific feature domain with request/response formats, authentication requirements, and example usage.

## 🔐 Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require authentication via session cookies.

**Session-based Authentication:**
```javascript
// Login first to establish a session
POST /api/auth/login
{
  "email": "rehber@okul.edu.tr",
  "password": "demo"
}

// Session cookie is set automatically
// All subsequent requests include the cookie
```

## 🔑 Authorization (RBAC)

Rehber360 uses Role-Based Access Control with four roles:

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Admin** | Full Access | All CRUD operations, user management, system settings |
| **Counselor** | High Access | Student management, counseling, surveys, AI features |
| **Teacher** | Limited Access | View students, view analytics, limited updates |
| **Observer** | Read-Only | View-only access to students and reports |

## 📚 API Modules

### Core Features
- [Students API](./students.md) - Student management, profiles, academic data
- [Surveys API](./surveys.md) - Survey templates, distributions, responses
- [Exams API](./exams.md) - Exam results, analysis, goal tracking
- [Counseling API](./counseling.md) - Sessions, meeting notes, interventions

### AI Features
- [AI Assistant API](./ai-assistant.md) - Conversational AI for student counseling
- [AI Suggestions API](./ai-suggestions.md) - AI-generated profile update suggestions
- [Advanced AI Analysis API](./advanced-ai-analysis.md) - Deep psychological analysis
- [Profile Sync API](./profile-sync.md) - Living student profile updates

### Administrative
- [Authentication API](./authentication.md) - Login, logout, session management
- [Analytics API](./analytics.md) - School-wide statistics and insights
- [Career Guidance API](./career-guidance.md) - Career profiles and matching

### Support Features
- [Risk Assessment API](./risk-assessment.md) - Risk evaluation and tracking
- [Intervention Tracking API](./intervention-tracking.md) - Intervention management
- [Documents API](./documents.md) - File uploads and document management
- [Notifications API](./notifications.md) - Notification rules and delivery

## 🌐 Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-replit-url.repl.co/api
```

## 📝 Request Format

### Headers

```http
Content-Type: application/json
Cookie: connect.sid=<session-id>
```

### Request Body (POST/PUT)

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## ✅ Response Format

### Success Response

```json
{
  "id": 1,
  "name": "John Doe",
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": []
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET/PUT/DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Invalid input, validation errors |
| **401** | Unauthorized | Not logged in |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Duplicate resource (e.g., existing student_no) |
| **500** | Internal Server Error | Server-side error |

## 🔍 Common Query Parameters

### Filtering

```http
GET /api/students?class_level=9-A&risk_level=high
```

### Pagination

```http
GET /api/students?page=1&limit=50
```

### Sorting

```http
GET /api/students?sort_by=name&order=asc
```

### Search

```http
GET /api/students?search=John
```

## 📦 Bulk Operations

Many endpoints support bulk operations for efficiency:

```javascript
// Bulk create
POST /api/students/bulk
{
  "students": [
    { "name": "Student 1", "student_no": "2024-001" },
    { "name": "Student 2", "student_no": "2024-002" }
  ]
}

// Bulk update
PUT /api/students/bulk
{
  "ids": [1, 2, 3],
  "updates": { "class_level": "10-A" }
}

// Bulk delete
DELETE /api/students/bulk
{
  "ids": [1, 2, 3]
}
```

## 📊 Data Export

Most list endpoints support data export:

```javascript
// Export to Excel
GET /api/students/export?format=excel

// Export to CSV
GET /api/students/export?format=csv

// Export to PDF
GET /api/students/export?format=pdf
```

## 🚀 Rate Limiting

API endpoints have rate limits to prevent abuse:

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| **Read** (GET) | 200 requests | 15 minutes |
| **Write** (POST/PUT/DELETE) | 50 requests | 15 minutes |
| **AI** (AI endpoints) | 30 requests | 15 minutes |
| **File Upload** | 10 requests | 15 minutes |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1698580800
```

## 🧪 Testing

### Postman Collection

Import the Postman collection for easy API testing:
```
docs/api/postman_collection.json
```

### Example cURL Request

```bash
curl -X GET 'http://localhost:5000/api/students' \
  -H 'Cookie: connect.sid=your-session-id' \
  -H 'Content-Type: application/json'
```

### Example JavaScript (Fetch)

```javascript
const response = await fetch('/api/students', {
  method: 'GET',
  credentials: 'include', // Include session cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

const students = await response.json();
```

## 📄 Changelog

- **v2.0.0** (October 2025): Feature-based architecture, 39 feature modules
- **v1.5.0** (September 2025): AI integration (OpenAI, Gemini, Ollama)
- **v1.0.0** (August 2025): Initial API release

## 🤝 Contributing

When adding new API endpoints:

1. Document in the appropriate feature file
2. Include request/response examples
3. Specify authentication requirements
4. Note any rate limits
5. Add error handling examples

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Backend Team
