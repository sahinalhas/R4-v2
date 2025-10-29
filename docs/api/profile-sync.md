# Profile Sync API

## 📋 Overview

The Profile Sync API enables the "Living Student Profile" feature, automatically synchronizing and updating student profiles from multiple data sources including counseling sessions, surveys, exams, and AI suggestions.

**Base Path:** `/api/profile-sync`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor

---

## 🎯 Endpoints

### 1. Sync Student Profile

Triggers a comprehensive sync of a student's profile from all available data sources.

**Endpoint:**
```http
POST /api/profile-sync/:studentId/sync
```

**Parameters:**
- `studentId` (path, required): Student ID

**Request Body:**
```json
{
  "sources": ["counseling", "surveys", "exams", "ai_suggestions"],
  "auto_approve": false,
  "generate_summary": true
}
```

**Response:**
```json
{
  "student_id": 1,
  "sync_status": "completed",
  "sources_synced": {
    "counseling": {
      "sessions_processed": 5,
      "updates_found": 3,
      "fields_updated": ["emotional_state", "family_dynamics", "peer_relationships"]
    },
    "surveys": {
      "surveys_processed": 2,
      "updates_found": 1,
      "fields_updated": ["interests", "self_perception"]
    },
    "exams": {
      "exams_processed": 8,
      "updates_found": 2,
      "fields_updated": ["academic_strengths", "academic_weaknesses"]
    },
    "ai_suggestions": {
      "suggestions_processed": 4,
      "updates_approved": 2,
      "updates_pending": 2
    }
  },
  "total_updates": 8,
  "pending_approval": 2,
  "summary": "Profile updated with recent counseling insights and exam performance analysis. 2 AI suggestions require manual approval.",
  "synced_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 2. Get Sync Status

Retrieves the current sync status and last sync timestamp for a student.

**Endpoint:**
```http
GET /api/profile-sync/:studentId/status
```

**Parameters:**
- `studentId` (path, required): Student ID

**Response:**
```json
{
  "student_id": 1,
  "last_sync": "2025-10-29T10:00:00.000Z",
  "sync_frequency": "daily",
  "next_scheduled_sync": "2025-10-30T06:00:00.000Z",
  "pending_updates": 2,
  "auto_sync_enabled": true,
  "data_sources": {
    "counseling": {
      "last_synced": "2025-10-29T10:00:00.000Z",
      "status": "up_to_date"
    },
    "surveys": {
      "last_synced": "2025-10-28T10:00:00.000Z",
      "status": "needs_sync",
      "new_responses": 1
    },
    "exams": {
      "last_synced": "2025-10-29T10:00:00.000Z",
      "status": "up_to_date"
    },
    "ai_suggestions": {
      "last_synced": "2025-10-29T10:00:00.000Z",
      "status": "pending_approval",
      "pending_count": 2
    }
  }
}
```

---

### 3. Batch Sync Profiles

Syncs multiple student profiles in a single batch operation.

**Endpoint:**
```http
POST /api/profile-sync/batch
```

**Request Body:**
```json
{
  "student_ids": [1, 2, 3, 4, 5],
  "sources": ["counseling", "surveys", "exams"],
  "priority": "high"
}
```

**Response:**
```json
{
  "batch_id": "batch_20251029_001",
  "total_students": 5,
  "status": "processing",
  "results": [
    {
      "student_id": 1,
      "status": "completed",
      "updates": 5
    },
    {
      "student_id": 2,
      "status": "completed",
      "updates": 3
    },
    {
      "student_id": 3,
      "status": "in_progress"
    },
    {
      "student_id": 4,
      "status": "queued"
    },
    {
      "student_id": 5,
      "status": "queued"
    }
  ],
  "started_at": "2025-10-29T10:00:00.000Z",
  "estimated_completion": "2025-10-29T10:05:00.000Z"
}
```

---

### 4. Configure Auto-Sync

Configures automatic sync settings for a student or school-wide.

**Endpoint:**
```http
PUT /api/profile-sync/settings
```

**Request Body:**
```json
{
  "scope": "student",
  "student_id": 1,
  "auto_sync_enabled": true,
  "frequency": "daily",
  "sync_time": "06:00",
  "sources": ["counseling", "surveys", "exams", "ai_suggestions"],
  "auto_approve_threshold": 0.8,
  "notification_enabled": true
}
```

**Response:**
```json
{
  "settings_id": "sync_settings_1",
  "scope": "student",
  "student_id": 1,
  "auto_sync_enabled": true,
  "frequency": "daily",
  "sync_time": "06:00",
  "sources": ["counseling", "surveys", "exams", "ai_suggestions"],
  "auto_approve_threshold": 0.8,
  "notification_enabled": true,
  "next_sync": "2025-10-30T06:00:00.000Z",
  "updated_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 5. Get Sync History

Retrieves sync history and changelog for a student profile.

**Endpoint:**
```http
GET /api/profile-sync/:studentId/history
```

**Parameters:**
- `studentId` (path, required): Student ID
- `limit` (query, optional): Number of records (default: 50)
- `page` (query, optional): Page number (default: 1)

**Response:**
```json
{
  "student_id": 1,
  "total_syncs": 120,
  "history": [
    {
      "sync_id": "sync_20251029_001",
      "synced_at": "2025-10-29T10:00:00.000Z",
      "trigger": "manual",
      "sources": ["counseling", "surveys"],
      "updates_applied": 3,
      "fields_changed": ["emotional_state", "interests", "peer_relationships"],
      "changelog": [
        {
          "field": "emotional_state",
          "old_value": "stable",
          "new_value": "anxious",
          "source": "counseling_session_45",
          "confidence": 0.92
        },
        {
          "field": "interests",
          "old_value": ["sports", "music"],
          "new_value": ["sports", "music", "coding"],
          "source": "survey_response_12",
          "confidence": 0.95
        }
      ]
    },
    {
      "sync_id": "sync_20251028_002",
      "synced_at": "2025-10-28T06:00:00.000Z",
      "trigger": "scheduled",
      "sources": ["exams"],
      "updates_applied": 2,
      "fields_changed": ["academic_strengths", "academic_weaknesses"]
    }
  ],
  "page": 1,
  "total_pages": 3
}
```

---

### 6. Resolve Sync Conflicts

Manually resolves conflicts when multiple data sources provide conflicting information.

**Endpoint:**
```http
POST /api/profile-sync/:studentId/resolve-conflict
```

**Request Body:**
```json
{
  "conflict_id": "conflict_123",
  "field": "emotional_state",
  "selected_value": "anxious",
  "selected_source": "counseling_session_45",
  "resolution_note": "Counselor observation more recent and reliable"
}
```

**Response:**
```json
{
  "conflict_id": "conflict_123",
  "field": "emotional_state",
  "resolved_value": "anxious",
  "resolved_by": "Mehmet Yılmaz (Counselor)",
  "resolved_at": "2025-10-29T10:00:00.000Z",
  "sync_triggered": true
}
```

---

## 🔄 Sync Workflow

```
1. Trigger Sync (manual or scheduled)
   ↓
2. Collect data from sources (counseling, surveys, exams, AI)
   ↓
3. Extract profile updates using AI analysis
   ↓
4. Check confidence scores and auto-approval threshold
   ↓
5. Auto-approve high-confidence updates (>80%)
   ↓
6. Queue low-confidence updates for manual approval
   ↓
7. Apply approved updates to profile
   ↓
8. Log changes and send notifications
   ↓
9. Return sync summary
```

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Sync Student Profile | ✅ | ✅ | ❌ | ❌ |
| Get Sync Status | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Batch Sync | ✅ | ✅ | ❌ | ❌ |
| Configure Auto-Sync | ✅ | ✅ | ❌ | ❌ |
| Get Sync History | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Resolve Conflicts | ✅ | ✅ | ❌ | ❌ |

---

## ⚠️ Error Responses

### Sync Already in Progress
```json
{
  "error": "SYNC_IN_PROGRESS",
  "message": "Profile sync already in progress for student 1",
  "current_sync_id": "sync_20251029_001"
}
```

### Insufficient Data Sources
```json
{
  "error": "INSUFFICIENT_DATA",
  "message": "No data sources available for sync",
  "details": "Student has no counseling sessions, surveys, or exam results"
}
```

---

## 🎯 Best Practices

1. **Scheduled Syncs**: Enable daily auto-sync at 6:00 AM for fresh morning data
2. **Confidence Threshold**: Set auto-approve threshold to 0.8 (80%) for reliable updates
3. **Manual Review**: Always review AI suggestions before approving critical profile changes
4. **Conflict Resolution**: Prioritize counselor observations over automated sources
5. **Batch Processing**: Use batch sync for class-wide updates at the end of the day

---

## 📊 Example Use Cases

### Use Case 1: Morning Profile Update
```javascript
// Auto-sync all students every morning at 6 AM
const sync = await fetch('/api/profile-sync/batch', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_ids: allStudentIds,
    sources: ['counseling', 'surveys', 'exams', 'ai_suggestions'],
    priority: 'low'
  })
});
```

### Use Case 2: Real-time Sync After Counseling
```javascript
// Sync profile immediately after counseling session
const sync = await fetch('/api/profile-sync/1/sync', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sources: ['counseling'],
    auto_approve: true,
    generate_summary: true
  })
});
```

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Backend Team
