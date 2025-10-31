# Surveys API

API documentation for survey management, distribution, and response collection.

## Base Path
```
/api/surveys
```

## Overview

The Surveys API manages:
- **Survey Templates**: Reusable survey definitions with questions
- **Survey Distributions**: Assignment of surveys to classes/students
- **Survey Responses**: Student answers and AI analysis

---

## Survey Templates

### List Survey Templates

```http
GET /api/surveys/templates
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `is_active` | boolean | Filter active/inactive templates |

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "templates": [
    {
      "id": 1,
      "title": "MEB Öğrenci Memnuniyet Anketi",
      "description": "Okul memnuniyet düzeyini ölçen standart anket",
      "category": "memnuniyet",
      "questions": [
        {
          "id": "q1",
          "type": "likert",
          "question": "Okulumdan memnunum",
          "options": ["Kesinlikle Katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle Katılıyorum"]
        },
        {
          "id": "q2",
          "type": "multiple_choice",
          "question": "En çok hangi dersi seviyorsunuz?",
          "options": ["Matematik", "Fen", "Türkçe", "İngilizce", "Diğer"]
        }
      ],
      "created_by": 1,
      "is_active": true,
      "created_at": "2024-09-01T10:00:00.000Z"
    }
  ]
}
```

---

### Create Survey Template

```http
POST /api/surveys/templates
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "title": "Zorbalık Değerlendirme Anketi",
  "description": "Okul içi zorbalık durumlarını tespit etmek için",
  "category": "davranış",
  "questions": [
    {
      "id": "q1",
      "type": "yes_no",
      "question": "Hiç zorbalığa maruz kaldınız mı?"
    },
    {
      "id": "q2",
      "type": "open_ended",
      "question": "Lütfen yaşadığınız durumu açıklayın"
    }
  ]
}
```

**Supported Question Types:**
- `multiple_choice`: Single selection
- `likert`: 5-point scale
- `yes_no`: Boolean
- `open_ended`: Free text
- `rating`: 1-10 numeric rating

**Example Response (201 Created):**
```json
{
  "id": 10,
  "title": "Zorbalık Değerlendirme Anketi",
  "category": "davranış",
  "questions": [...],
  "created_by": 1,
  "is_active": true,
  "created_at": "2025-10-29T11:00:00.000Z"
}
```

---

## Survey Distributions

### Create Distribution

Distribute a survey to students/classes.

```http
POST /api/surveys/distributions
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "template_id": 10,
  "target_class": "9-A",
  "start_date": "2025-10-30",
  "end_date": "2025-11-10"
}
```

**OR target specific students:**
```json
{
  "template_id": 10,
  "target_students": [1, 2, 3, 15, 22],
  "start_date": "2025-10-30",
  "end_date": "2025-11-10"
}
```

**Example Response (201 Created):**
```json
{
  "id": 45,
  "template_id": 10,
  "target_class": "9-A",
  "target_students": [1, 2, 3, 4, 5],
  "start_date": "2025-10-30",
  "end_date": "2025-11-10",
  "status": "active",
  "distributed_by": 1,
  "created_at": "2025-10-29T11:15:00.000Z"
}
```

---

### Get Distribution

```http
GET /api/surveys/distributions/:id
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "id": 45,
  "template": {
    "id": 10,
    "title": "Zorbalık Değerlendirme Anketi"
  },
  "target_class": "9-A",
  "target_students": 25,
  "responses_count": 18,
  "completion_rate": 72,
  "status": "active",
  "start_date": "2025-10-30",
  "end_date": "2025-11-10"
}
```

---

## Survey Responses

### Submit Response

Students submit survey answers.

```http
POST /api/surveys/responses/:distributionId
```

**Authorization:** All roles (students answer their own)

**Request Body:**
```json
{
  "student_id": 1,
  "responses": {
    "q1": "yes",
    "q2": "Arkadaşlarımdan biri benimle dalga geçiyor..."
  }
}
```

**Example Response (201 Created):**
```json
{
  "id": 123,
  "distribution_id": 45,
  "student_id": 1,
  "responses": {
    "q1": "yes",
    "q2": "Arkadaşlarımdan biri benimle dalga geçiyor..."
  },
  "submitted_at": "2025-10-30T14:20:00.000Z",
  "ai_analysis": {
    "sentiment": "negative",
    "risk_keywords": ["dalga geçmek", "zorbalık"],
    "requires_followup": true
  }
}
```

---

### Get Distribution Responses

Get all responses for a distribution.

```http
GET /api/surveys/distributions/:id/responses
```

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "distribution_id": 45,
  "total_responses": 18,
  "responses": [
    {
      "id": 123,
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "responses": {...},
      "submitted_at": "2025-10-30T14:20:00.000Z"
    }
  ],
  "analytics": {
    "completion_rate": 72,
    "avg_response_time": 8.5,
    "flagged_responses": 2
  }
}
```

---

### Bulk Import Responses (Excel)

Import survey responses from Excel file.

```http
POST /api/surveys/responses/import/:distributionId
```

**Authorization:** Admin, Counselor

**Content-Type:** `multipart/form-data`

**Request:**
```javascript
const formData = new FormData();
formData.append('file', excelFile);

fetch('/api/surveys/responses/import/45', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

**Excel Format:**
| student_no | q1 | q2 | q3 |
|------------|----|----|--- |
| 2024-001   | 5  | Memnunum | ... |
| 2024-002   | 4  | İyi | ... |

**Example Response (200 OK):**
```json
{
  "success": true,
  "imported": 23,
  "failed": 2,
  "errors": [
    {
      "row": 5,
      "student_no": "2024-999",
      "error": "Student not found"
    }
  ]
}
```

---

### Get Survey Analytics

Get aggregated analytics for a distribution.

```http
GET /api/surveys/distributions/:id/analytics
```

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "distribution_id": 45,
  "total_responses": 18,
  "completion_rate": 72,
  "question_analytics": {
    "q1": {
      "type": "yes_no",
      "responses": {
        "yes": 5,
        "no": 13
      },
      "percentages": {
        "yes": 27.8,
        "no": 72.2
      }
    },
    "q2": {
      "type": "likert",
      "responses": {
        "1": 2,
        "2": 3,
        "3": 5,
        "4": 6,
        "5": 2
      },
      "average": 3.17,
      "median": 3
    }
  },
  "ai_insights": {
    "overall_sentiment": "neutral",
    "flagged_responses": 2,
    "key_themes": ["memnuniyet", "sosyal ilişkiler", "akademik destek"]
  }
}
```

---

## Error Responses

```json
{
  "error": "Validation Error",
  "message": "Invalid survey template ID",
  "details": []
}
```

**Common Errors:**
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Template/distribution not found
- `409 Conflict`: Student already submitted response

---

**Related Documentation:**
- [API Overview](./README.md)
- [Students API](./students.md)
- [AI Analysis API](./advanced-ai-analysis.md)

**Last Updated:** October 29, 2025
