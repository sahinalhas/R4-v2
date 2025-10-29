# AI Suggestions API

API documentation for the AI-powered profile update suggestion system.

## Base Path
```
/api/ai-suggestions
```

## Overview

The AI Suggestions API manages the approval queue for AI-generated profile updates. AI analyzes student data and suggests profile field updates that require user approval before being applied.

---

## Suggestion Management

### List Suggestions

Get all pending/approved/rejected suggestions.

```http
GET /api/ai-suggestions
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `student_id` | number | Filter by student |
| `status` | string | pending, approved, rejected, expired |
| `priority` | string | low, medium, high, urgent |
| `suggestion_type` | string | academic_strength, social_emotional, behavioral, career, etc. |

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "suggestions": [
    {
      "id": 123,
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "suggestion_type": "academic_strength",
      "field_name": "academic_strengths",
      "current_value": "Matematik, Geometri",
      "suggested_value": "Matematik, Geometri, Problem Çözme, Analitik Düşünme",
      "reasoning": "Son 6 sınavda sürekli yüksek performans (ort. 32 net MAT). Geometri ve problem çözme sorularında %95 başarı oranı. Analitik düşünme becerisi güçlü.",
      "confidence": 0.92,
      "priority": "medium",
      "data_sources": [
        "6 exam results (MAT)",
        "Teacher feedback (positive)",
        "Behavior observations"
      ],
      "status": "pending",
      "created_at": "2025-10-29T10:00:00.000Z"
    },
    {
      "id": 124,
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "suggestion_type": "risk_alert",
      "field_name": "risk_level",
      "current_value": "low",
      "suggested_value": "medium",
      "reasoning": "Devamsızlık artışı tespit edildi (son 2 haftada 6 gün). Akademik performansta %15 düşüş. Sosyal izolasyon belirtileri.",
      "confidence": 0.88,
      "priority": "high",
      "data_sources": [
        "Attendance records",
        "Recent exam decline",
        "Counseling session notes"
      ],
      "status": "pending",
      "created_at": "2025-10-29T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  },
  "summary": {
    "pending": 15,
    "approved_today": 8,
    "rejected_today": 2,
    "high_priority": 5
  }
}
```

---

### Get Suggestion

Get detailed information about a specific suggestion.

```http
GET /api/ai-suggestions/:id
```

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "id": 123,
  "student": {
    "id": 1,
    "name": "Ali Yılmaz",
    "class_level": "9-A"
  },
  "suggestion_type": "academic_strength",
  "field_name": "academic_strengths",
  "current_value": "Matematik, Geometri",
  "suggested_value": "Matematik, Geometri, Problem Çözme, Analitik Düşünme",
  "reasoning": "Detaylı analiz...",
  "confidence": 0.92,
  "priority": "medium",
  "data_sources": [
    {
      "type": "exam_results",
      "count": 6,
      "summary": "Son 6 MAT sınavında ortalama 32 net"
    },
    {
      "type": "teacher_feedback",
      "count": 2,
      "summary": "Matematik öğretmeni: Analitik düşünme becerisi güçlü"
    }
  ],
  "similar_students": [
    {
      "student_id": 15,
      "similarity_score": 0.87,
      "profile_match": "Benzer akademik güçlü yönler"
    }
  ],
  "impact_analysis": {
    "affected_fields": ["academic_strengths", "career_recommendations"],
    "estimated_benefit": "Kariyer rehberliği için daha doğru eşleştirme"
  },
  "status": "pending",
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

---

### Approve Suggestion

Approve and apply an AI suggestion.

```http
POST /api/ai-suggestions/:id/approve
```

**Authorization:** Admin, Counselor

**Request Body (optional):**
```json
{
  "notes": "Öğretmen görüşmeleri ile doğrulandı. Uygulanıyor.",
  "modified_value": null
}
```

**Example Response (200 OK):**
```json
{
  "id": 123,
  "status": "approved",
  "applied": true,
  "student_id": 1,
  "field_updated": "academic_strengths",
  "new_value": "Matematik, Geometri, Problem Çözme, Analitik Düşünme",
  "reviewed_by": 1,
  "reviewed_at": "2025-10-29T12:00:00.000Z",
  "notes": "Öğretmen görüşmeleri ile doğrulandı"
}
```

---

### Reject Suggestion

Reject an AI suggestion.

```http
POST /api/ai-suggestions/:id/reject
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "reason": "Veri yetersiz, daha fazla gözlem gerekiyor"
}
```

**Example Response (200 OK):**
```json
{
  "id": 123,
  "status": "rejected",
  "reviewed_by": 1,
  "reviewed_at": "2025-10-29T12:00:00.000Z",
  "rejection_reason": "Veri yetersiz, daha fazla gözlem gerekiyor"
}
```

---

### Modify and Approve

Modify the suggested value before approving.

```http
POST /api/ai-suggestions/:id/modify-approve
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "modified_value": "Matematik, Problem Çözme",
  "notes": "Analitik düşünme kısmı henüz erken, diğerleri onaylandı"
}
```

**Example Response (200 OK):**
```json
{
  "id": 123,
  "status": "approved",
  "applied": true,
  "original_suggestion": "Matematik, Geometri, Problem Çözme, Analitik Düşünme",
  "applied_value": "Matematik, Problem Çözme",
  "modified": true,
  "reviewed_by": 1,
  "reviewed_at": "2025-10-29T12:00:00.000Z"
}
```

---

## Bulk Operations

### Bulk Approve

Approve multiple suggestions at once.

```http
POST /api/ai-suggestions/bulk-approve
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "suggestion_ids": [123, 124, 125],
  "notes": "Toplu onay - haftalık değerlendirme"
}
```

**Example Response (200 OK):**
```json
{
  "approved_count": 3,
  "failed_count": 0,
  "results": [
    { "id": 123, "status": "approved", "applied": true },
    { "id": 124, "status": "approved", "applied": true },
    { "id": 125, "status": "approved", "applied": true }
  ]
}
```

---

### Bulk Reject

Reject multiple suggestions.

```http
POST /api/ai-suggestions/bulk-reject
```

**Request Body:**
```json
{
  "suggestion_ids": [126, 127],
  "reason": "Toplu red - yetersiz veri"
}
```

---

## Generation

### Generate Suggestions for Student

Trigger AI to generate new suggestions for a student.

```http
POST /api/ai-suggestions/generate/:studentId
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "focus_areas": ["academic", "behavioral", "social_emotional"],
  "provider": "gemini"
}
```

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "generated_count": 5,
  "suggestions": [
    {
      "id": 150,
      "suggestion_type": "academic_strength",
      "priority": "medium",
      "confidence": 0.92
    },
    {
      "id": 151,
      "suggestion_type": "behavioral",
      "priority": "low",
      "confidence": 0.78
    }
  ],
  "analysis_time_ms": 2500
}
```

---

### Batch Generate

Generate suggestions for multiple students.

```http
POST /api/ai-suggestions/batch-generate
```

**Authorization:** Admin

**Request Body:**
```json
{
  "class_level": "9-A",
  "focus_areas": ["academic", "career"]
}
```

**Example Response (200 OK):**
```json
{
  "total_students": 25,
  "processed": 25,
  "total_suggestions": 78,
  "by_priority": {
    "urgent": 2,
    "high": 12,
    "medium": 45,
    "low": 19
  }
}
```

---

## Analytics

### Suggestion Statistics

Get AI suggestion statistics.

```http
GET /api/ai-suggestions/stats
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | string | Start date (YYYY-MM-DD) |
| `date_to` | string | End date (YYYY-MM-DD) |
| `counselor_id` | number | Filter by reviewer |

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "total_generated": 450,
  "total_reviewed": 380,
  "approval_rate": 84.5,
  "rejection_rate": 15.5,
  "by_type": {
    "academic_strength": 120,
    "social_emotional": 95,
    "behavioral": 78,
    "career": 67,
    "risk_alert": 45,
    "intervention": 45
  },
  "by_priority": {
    "urgent": 12,
    "high": 85,
    "medium": 220,
    "low": 133
  },
  "avg_confidence": 0.87,
  "avg_review_time_hours": 18.5,
  "top_reviewers": [
    { "counselor_id": 1, "name": "Ahmet Yılmaz", "reviewed_count": 145 },
    { "counselor_id": 2, "name": "Ayşe Demir", "reviewed_count": 120 }
  ]
}
```

---

### Pending Summary

Get summary of pending suggestions requiring review.

```http
GET /api/ai-suggestions/pending-summary
```

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "total_pending": 45,
  "urgent": 3,
  "high_priority": 12,
  "pending_by_type": {
    "risk_alert": 8,
    "academic_strength": 12,
    "behavioral": 10,
    "career": 8,
    "intervention": 7
  },
  "oldest_pending": {
    "id": 98,
    "student_id": 22,
    "created_at": "2025-10-15T10:00:00.000Z",
    "age_days": 14,
    "priority": "high"
  }
}
```

---

## Error Handling

```json
// 400 Bad Request - Already reviewed
{
  "error": "Bad Request",
  "message": "Suggestion has already been reviewed"
}

// 404 Not Found - Suggestion not found
{
  "error": "Not Found",
  "message": "AI suggestion with ID 999 not found"
}

// 409 Conflict - Student profile locked
{
  "error": "Conflict",
  "message": "Student profile is locked for editing. Cannot apply suggestion."
}
```

---

**Related Documentation:**
- [API Overview](./README.md)
- [AI Assistant API](./ai-assistant.md)
- [Students API](./students.md)

**Last Updated:** October 29, 2025
