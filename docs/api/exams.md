# Exams API

API documentation for exam management, results tracking, and academic analytics.

## Base Path
```
/api/exams
/api/exam-management
```

## Overview

Manage exam results, track academic performance, and generate comparative analytics.

---

## Exam Results

### List Exam Results

Get exam results with filtering.

```http
GET /api/exams
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `student_id` | number | Filter by student |
| `exam_type` | string | TYT, AYT, Deneme, Okul, Diğer |
| `exam_date_from` | string | Start date (YYYY-MM-DD) |
| `exam_date_to` | string | End date (YYYY-MM-DD) |
| `subject_code` | string | Filter by subject |

**Authorization:** All roles

**Example Request:**
```javascript
GET /api/exams?student_id=1&exam_type=TYT&exam_date_from=2025-09-01
```

**Example Response (200 OK):**
```json
{
  "results": [
    {
      "id": 101,
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "exam_type": "TYT",
      "exam_date": "2025-10-15",
      "subject_code": "MAT",
      "subject_name": "Matematik",
      "score": 85,
      "correct_answers": 34,
      "wrong_answers": 4,
      "empty_answers": 2,
      "net_score": 32.67,
      "percentile": 78.5,
      "target_score": 90,
      "notes": "İyi performans, geometri konusunda eksik",
      "created_at": "2025-10-15T16:00:00.000Z"
    }
  ],
  "summary": {
    "total_exams": 24,
    "average_net": 28.5,
    "highest_net": 35.25,
    "lowest_net": 18.0,
    "improvement_trend": "increasing"
  }
}
```

---

### Get Single Exam Result

```http
GET /api/exams/:id
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "id": 101,
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "exam_type": "TYT",
  "exam_date": "2025-10-15",
  "subject_code": "MAT",
  "subject_name": "Matematik",
  "score": 85,
  "correct_answers": 34,
  "wrong_answers": 4,
  "empty_answers": 2,
  "net_score": 32.67,
  "percentile": 78.5,
  "target_score": 90,
  "analysis": {
    "vs_target": -7.33,
    "vs_class_avg": +5.2,
    "vs_previous": +2.5,
    "trend": "improving"
  }
}
```

---

### Create Exam Result

```http
POST /api/exams
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "student_id": 1,
  "exam_type": "TYT",
  "exam_date": "2025-10-29",
  "subject_code": "FIZ",
  "subject_name": "Fizik",
  "correct_answers": 12,
  "wrong_answers": 6,
  "empty_answers": 2,
  "target_score": 18
}
```

**Auto-Calculated Fields:**
- `net_score`: (correct - (wrong / 4))
- `score`: (net_score / total_questions) * 100
- `percentile`: Based on class/school averages

**Example Response (201 Created):**
```json
{
  "id": 150,
  "student_id": 1,
  "exam_type": "TYT",
  "exam_date": "2025-10-29",
  "subject_code": "FIZ",
  "subject_name": "Fizik",
  "correct_answers": 12,
  "wrong_answers": 6,
  "empty_answers": 2,
  "net_score": 10.5,
  "score": 52.5,
  "percentile": 45.2,
  "target_score": 18,
  "created_at": "2025-10-29T11:00:00.000Z"
}
```

---

### Update Exam Result

```http
PUT /api/exams/:id
```

**Authorization:** Admin, Counselor

**Request Body (partial updates allowed):**
```json
{
  "correct_answers": 13,
  "wrong_answers": 5,
  "notes": "Güncelleme: Optik okuma hatası düzeltildi"
}
```

---

### Delete Exam Result

```http
DELETE /api/exams/:id
```

**Authorization:** Admin only

---

## Bulk Operations

### Bulk Import (Excel)

Import exam results from Excel file.

```http
POST /api/exam-management/excel/import
```

**Authorization:** Admin, Counselor

**Content-Type:** `multipart/form-data`

**Excel Format:**

| student_no | exam_type | exam_date | subject_code | correct | wrong | empty |
|------------|-----------|-----------|--------------|---------|-------|-------|
| 2024-001   | TYT       | 2025-10-15 | MAT         | 34      | 4     | 2     |
| 2024-002   | TYT       | 2025-10-15 | MAT         | 28      | 8     | 4     |

**Example Response (200 OK):**
```json
{
  "success": true,
  "imported": 145,
  "failed": 3,
  "errors": [
    {
      "row": 12,
      "student_no": "2024-999",
      "error": "Student not found"
    },
    {
      "row": 45,
      "student_no": "2024-078",
      "error": "Invalid exam date format"
    }
  ]
}
```

---

### Bulk Export

Export exam results to Excel/CSV/PDF.

```http
GET /api/exam-management/export
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | excel, csv, pdf |
| `class_level` | string | Filter by class |
| `exam_type` | string | Filter by exam type |
| `exam_date_from` | string | Start date |
| `exam_date_to` | string | End date |

**Example Request:**
```javascript
GET /api/exam-management/export?format=excel&class_level=9-A&exam_type=TYT
```

**Response:** File download with appropriate MIME type.

---

## Analytics

### Student Performance Analytics

Get detailed performance analytics for a student.

```http
GET /api/exams/analytics/student/:studentId
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "overall": {
    "total_exams": 24,
    "average_net": 28.5,
    "average_score": 71.25,
    "trend": "improving",
    "improvement_rate": 12.5
  },
  "by_subject": [
    {
      "subject_code": "MAT",
      "subject_name": "Matematik",
      "exams_taken": 6,
      "average_net": 32.67,
      "highest_net": 35.25,
      "lowest_net": 28.0,
      "trend": "stable",
      "vs_target": -2.33
    },
    {
      "subject_code": "FIZ",
      "subject_name": "Fizik",
      "exams_taken": 6,
      "average_net": 10.5,
      "highest_net": 14.0,
      "lowest_net": 7.5,
      "trend": "declining",
      "vs_target": -7.5
    }
  ],
  "strengths": ["Matematik", "Kimya", "Biyoloji"],
  "weaknesses": ["Fizik", "Edebiyat"],
  "recommendations": [
    {
      "subject": "Fizik",
      "priority": "high",
      "suggestion": "Birebir ek ders önerilir",
      "expected_improvement": "+5 net"
    }
  ]
}
```

---

### Class Performance Analytics

Get class-wide performance statistics.

```http
GET /api/exams/analytics/class/:classLevel
```

**Authorization:** Admin, Counselor, Teacher

**Example Request:**
```javascript
GET /api/exams/analytics/class/9-A?exam_type=TYT&exam_date=2025-10-15
```

**Example Response (200 OK):**
```json
{
  "class_level": "9-A",
  "exam_type": "TYT",
  "exam_date": "2025-10-15",
  "students_count": 25,
  "participated": 24,
  "subjects": [
    {
      "subject_code": "MAT",
      "subject_name": "Matematik",
      "class_average": 27.5,
      "school_average": 25.2,
      "national_average": 22.8,
      "highest_net": 38.0,
      "lowest_net": 12.0,
      "median": 28.0,
      "std_deviation": 6.2
    }
  ],
  "top_performers": [
    { "student_id": 5, "name": "Zeynep Kaya", "total_net": 125.5 },
    { "student_id": 12, "name": "Mehmet Demir", "total_net": 118.25 }
  ],
  "need_support": [
    { "student_id": 1, "name": "Ali Yılmaz", "subjects": ["FIZ", "KİM"] }
  ]
}
```

---

### Comparative Analysis

Compare student performance across exams.

```http
GET /api/exams/analytics/compare
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `student_id` | number | Student to analyze |
| `exam_ids` | number[] | Exams to compare (comma-separated) |
| `subject_code` | string | Focus on specific subject |

**Example Request:**
```javascript
GET /api/exams/analytics/compare?student_id=1&exam_ids=101,102,103&subject_code=MAT
```

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "subject_code": "MAT",
  "exams": [
    {
      "exam_id": 101,
      "exam_date": "2025-09-15",
      "net_score": 28.0,
      "percentile": 65.5
    },
    {
      "exam_id": 102,
      "exam_date": "2025-10-01",
      "net_score": 30.5,
      "percentile": 72.0
    },
    {
      "exam_id": 103,
      "exam_date": "2025-10-15",
      "net_score": 32.67,
      "percentile": 78.5
    }
  ],
  "trend_analysis": {
    "direction": "improving",
    "rate_of_change": "+1.56 net per exam",
    "consistency": "high",
    "prediction_next_exam": 34.23
  }
}
```

---

### Goal Tracking

Track progress toward exam goals.

```http
GET /api/exams/analytics/goals/:studentId
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "goals": [
    {
      "subject_code": "MAT",
      "subject_name": "Matematik",
      "target_net": 35,
      "current_avg": 32.67,
      "gap": -2.33,
      "progress_percent": 93.3,
      "status": "on_track",
      "estimated_achievement_date": "2025-11-15"
    },
    {
      "subject_code": "FIZ",
      "subject_name": "Fizik",
      "target_net": 18,
      "current_avg": 10.5,
      "gap": -7.5,
      "progress_percent": 58.3,
      "status": "needs_support",
      "estimated_achievement_date": null
    }
  ]
}
```

---

## Error Handling

Common error responses:

```json
// 400 Bad Request - Invalid data
{
  "error": "Validation Error",
  "message": "Invalid exam date: must be in YYYY-MM-DD format"
}

// 404 Not Found - Student not found
{
  "error": "Not Found",
  "message": "Student with ID 999 not found"
}

// 409 Conflict - Duplicate exam entry
{
  "error": "Conflict",
  "message": "Exam result already exists for this student/exam/subject combination"
}
```

---

**Related Documentation:**
- [API Overview](./README.md)
- [Students API](./students.md)
- [Analytics API](./analytics.md)

**Last Updated:** October 29, 2025
