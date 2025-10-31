# Counseling API

API documentation for counseling session management and tracking.

## Base Path
```
/api/counseling
/api/counseling-sessions
```

## Overview

Manage individual and group counseling sessions, meeting notes, and follow-up actions.

---

## Counseling Sessions

### List Sessions

Get counseling sessions with filtering.

```http
GET /api/counseling-sessions
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `student_id` | number | Filter by student |
| `session_type` | string | individual, group, family, crisis |
| `status` | string | scheduled, completed, cancelled, no_show |
| `date_from` | string | Start date (YYYY-MM-DD) |
| `date_to` | string | End date (YYYY-MM-DD) |

**Authorization:** Admin, Counselor (own sessions), Observer (read-only)

**Example Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": 45,
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "counselor_id": 1,
      "counselor_name": "Ahmet Yılmaz",
      "session_type": "individual",
      "session_date": "2025-10-29",
      "duration": 45,
      "topic": "Academic performance concerns",
      "notes": "Student showing improvement in motivation...",
      "action_items": "Schedule follow-up in 2 weeks, coordinate with math teacher",
      "follow_up_date": "2025-11-12",
      "status": "completed",
      "risk_flags": ["academic_decline", "low_motivation"],
      "ai_summary": "Student discusses recent academic challenges. Shows willingness to improve.",
      "ai_keywords": ["motivation", "academic", "support"],
      "ai_sentiment": "neutral",
      "created_at": "2025-10-29T10:00:00.000Z",
      "updated_at": "2025-10-29T11:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

---

### Get Session

Get detailed session information.

```http
GET /api/counseling-sessions/:id
```

**Authorization:** Admin, Counselor (own sessions), Observer (read-only)

**Example Response (200 OK):**
```json
{
  "id": 45,
  "student": {
    "id": 1,
    "name": "Ali Yılmaz",
    "class_level": "9-A",
    "risk_level": "medium"
  },
  "counselor": {
    "id": 1,
    "name": "Ahmet Yılmaz"
  },
  "session_type": "individual",
  "session_date": "2025-10-29",
  "duration": 45,
  "topic": "Academic performance concerns",
  "notes": "Detailed session notes...",
  "action_items": "1. Schedule study skills workshop\n2. Coordinate with teachers\n3. Follow-up in 2 weeks",
  "follow_up_date": "2025-11-12",
  "status": "completed",
  "risk_flags": ["academic_decline", "low_motivation"],
  "ai_analysis": {
    "summary": "Student discusses recent academic challenges...",
    "keywords": ["motivation", "academic", "support", "improvement"],
    "sentiment": "neutral",
    "risk_assessment": "medium",
    "recommended_actions": [
      "Schedule academic support",
      "Parent contact recommended",
      "Monitor progress weekly"
    ]
  },
  "attachments": [],
  "created_at": "2025-10-29T10:00:00.000Z",
  "updated_at": "2025-10-29T11:30:00.000Z"
}
```

---

### Create Session

Schedule a new counseling session.

```http
POST /api/counseling-sessions
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "student_id": 1,
  "session_type": "individual",
  "session_date": "2025-11-05",
  "duration": 45,
  "topic": "Career guidance discussion",
  "notes": "Initial career interests assessment",
  "follow_up_date": "2025-11-19"
}
```

**Session Types:**
- `individual`: One-on-one session
- `group`: Multiple students
- `family`: Student + family members
- `crisis`: Emergency intervention

**Example Response (201 Created):**
```json
{
  "id": 150,
  "student_id": 1,
  "counselor_id": 1,
  "session_type": "individual",
  "session_date": "2025-11-05",
  "duration": 45,
  "topic": "Career guidance discussion",
  "notes": "Initial career interests assessment",
  "status": "scheduled",
  "created_at": "2025-10-29T12:00:00.000Z"
}
```

---

### Update Session

Update session details.

```http
PUT /api/counseling-sessions/:id
```

**Authorization:** Admin, Counselor (own sessions)

**Request Body (partial updates allowed):**
```json
{
  "status": "completed",
  "notes": "Updated notes after session completion...",
  "action_items": "Follow-up scheduled, parent meeting arranged",
  "ai_summary": "AI-generated summary of session"
}
```

---

### Complete Session

Mark session as completed and trigger AI analysis.

```http
POST /api/counseling-sessions/:id/complete
```

**Authorization:** Admin, Counselor (own sessions)

**Request Body:**
```json
{
  "notes": "Final session notes...",
  "action_items": "1. Schedule follow-up\n2. Contact parents",
  "trigger_ai_analysis": true
}
```

**Example Response (200 OK):**
```json
{
  "id": 45,
  "status": "completed",
  "completed_at": "2025-10-29T11:30:00.000Z",
  "ai_analysis": {
    "summary": "Auto-generated summary...",
    "keywords": ["motivation", "academic"],
    "sentiment": "neutral",
    "risk_assessment": "medium"
  }
}
```

---

### Delete Session

Delete/cancel a session.

```http
DELETE /api/counseling-sessions/:id
```

**Authorization:** Admin, Counselor (own sessions)

**Example Response (200 OK):**
```json
{
  "message": "Session deleted successfully",
  "id": 150
}
```

---

## AI Features

### AI Session Summary

Generate AI summary from session notes.

```http
POST /api/counseling-sessions/:id/ai-summary
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "include_recommendations": true,
  "provider": "gemini"
}
```

**Example Response (200 OK):**
```json
{
  "session_id": 45,
  "summary": "Öğrenci akademik performans endişelerini paylaştı. Son sınavlarda düşüş gözlemlendi. Motivasyon eksikliği belirtildi.",
  "keywords": ["akademik düşüş", "motivasyon", "sınav kaygısı"],
  "sentiment": "negative",
  "risk_level": "medium",
  "recommendations": [
    {
      "type": "academic",
      "action": "Birebir ders desteği ayarlanmalı",
      "priority": "high"
    },
    {
      "type": "psychological",
      "action": "Motivasyon görüşmesi planlanmalı",
      "priority": "medium"
    }
  ]
}
```

---

### Voice Transcription

Transcribe voice recordings to text (uses STT providers).

```http
POST /api/counseling-sessions/:id/transcribe
```

**Authorization:** Admin, Counselor

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('provider', 'gemini'); // or 'openai', 'web-speech'

fetch('/api/counseling-sessions/45/transcribe', {
  method: 'POST',
  body: formData
});
```

**Example Response (200 OK):**
```json
{
  "session_id": 45,
  "transcription": "Öğrenci: Son sınavlarımda başarısız oldum...\nRehber: Ne olduğunu düşünüyorsun?",
  "duration_seconds": 180,
  "provider": "gemini",
  "confidence": 0.94
}
```

---

## Analytics

### Session Statistics

Get counseling session statistics.

```http
GET /api/counseling-sessions/stats
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `counselor_id` | number | Filter by counselor |
| `date_from` | string | Start date |
| `date_to` | string | End date |

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "total_sessions": 156,
  "by_type": {
    "individual": 98,
    "group": 32,
    "family": 18,
    "crisis": 8
  },
  "by_status": {
    "scheduled": 15,
    "completed": 125,
    "cancelled": 8,
    "no_show": 8
  },
  "average_duration": 42,
  "completion_rate": 80.1,
  "top_topics": [
    { "topic": "Academic performance", "count": 45 },
    { "topic": "Career guidance", "count": 32 },
    { "topic": "Social issues", "count": 28 }
  ]
}
```

---

### Student Session History

Get all sessions for a specific student.

```http
GET /api/counseling-sessions/student/:studentId/history
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "total_sessions": 8,
  "sessions": [
    {
      "id": 45,
      "session_date": "2025-10-29",
      "topic": "Academic performance",
      "status": "completed"
    },
    {
      "id": 38,
      "session_date": "2025-10-15",
      "topic": "Motivation assessment",
      "status": "completed"
    }
  ],
  "timeline": {
    "first_session": "2024-09-15",
    "last_session": "2025-10-29",
    "frequency": "biweekly"
  }
}
```

---

## Bulk Operations

### Auto-Complete Old Sessions

Auto-complete sessions older than specified date.

```http
POST /api/counseling-sessions/auto-complete
```

**Authorization:** Admin only

**Request Body:**
```json
{
  "older_than_days": 7,
  "default_notes": "Session auto-completed due to age"
}
```

**Example Response (200 OK):**
```json
{
  "completed_count": 12,
  "session_ids": [23, 24, 27, 31, ...]
}
```

---

## Error Handling

```json
// 403 Forbidden - Cannot edit other counselor's session
{
  "error": "Forbidden",
  "message": "You can only modify your own counseling sessions"
}

// 404 Not Found - Session not found
{
  "error": "Not Found",
  "message": "Counseling session with ID 999 not found"
}

// 409 Conflict - Session already completed
{
  "error": "Conflict",
  "message": "Cannot modify a completed session"
}
```

---

**Related Documentation:**
- [API Overview](./README.md)
- [Students API](./students.md)
- [AI Assistant API](./ai-assistant.md)

**Last Updated:** October 29, 2025
