# Students API

Complete API documentation for student management endpoints.

## Base Path
```
/api/students
```

## Authentication
All endpoints require authentication. Role requirements specified per endpoint.

---

## Endpoints

### List Students

Get a paginated list of students with optional filtering.

```http
GET /api/students
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `class_level` | string | No | Filter by class (e.g., "9-A") |
| `risk_level` | string | No | Filter by risk level (low/medium/high/critical) |
| `search` | string | No | Search by name or student number |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 50, max: 200) |
| `sort_by` | string | No | Sort field (name/student_no/class_level) |
| `order` | string | No | Sort order (asc/desc) |

**Authorization:** All roles

**Example Request:**
```javascript
GET /api/students?class_level=9-A&risk_level=high&page=1&limit=20
```

**Example Response (200 OK):**
```json
{
  "students": [
    {
      "id": 1,
      "student_no": "2024-001",
      "name": "Ali Yılmaz",
      "date_of_birth": "2009-05-15",
      "gender": "male",
      "class_level": "9-A",
      "section": "Fen",
      "parent_name": "Mehmet Yılmaz",
      "parent_phone": "0532-123-4567",
      "address": "İstanbul, Kadıköy",
      "risk_level": "high",
      "notes": "Requires additional support",
      "created_at": "2024-09-01T08:00:00.000Z",
      "updated_at": "2025-10-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

---

### Get Student

Get detailed information about a specific student.

```http
GET /api/students/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Student ID |

**Authorization:** All roles

**Example Request:**
```javascript
GET /api/students/1
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "student_no": "2024-001",
  "name": "Ali Yılmaz",
  "date_of_birth": "2009-05-15",
  "gender": "male",
  "class_level": "9-A",
  "section": "Fen",
  "parent_name": "Mehmet Yılmaz",
  "parent_phone": "0532-123-4567",
  "address": "İstanbul, Kadıköy",
  "risk_level": "high",
  "notes": "Requires additional support",
  "created_at": "2024-09-01T08:00:00.000Z",
  "updated_at": "2025-10-15T14:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Student not found
```json
{
  "error": "Not Found",
  "message": "Student with ID 999 not found"
}
```

---

### Create Student

Create a new student record.

```http
POST /api/students
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "student_no": "2024-150",
  "name": "Ayşe Demir",
  "date_of_birth": "2009-08-22",
  "gender": "female",
  "class_level": "9-B",
  "section": "Sayısal",
  "parent_name": "Fatma Demir",
  "parent_phone": "0533-987-6543",
  "address": "Ankara, Çankaya",
  "notes": "New transfer student"
}
```

**Validation Rules:**
- `student_no`: Required, unique, alphanumeric
- `name`: Required, min 3 characters
- `date_of_birth`: Optional, valid date (YYYY-MM-DD)
- `gender`: Optional, one of: male, female, other
- `class_level`: Required, format: "9-A" to "12-E"
- `parent_phone`: Optional, valid Turkish phone format

**Example Response (201 Created):**
```json
{
  "id": 150,
  "student_no": "2024-150",
  "name": "Ayşe Demir",
  "date_of_birth": "2009-08-22",
  "gender": "female",
  "class_level": "9-B",
  "section": "Sayısal",
  "parent_name": "Fatma Demir",
  "parent_phone": "0533-987-6543",
  "address": "Ankara, Çankaya",
  "risk_level": "low",
  "notes": "New transfer student",
  "created_at": "2025-10-29T10:30:00.000Z",
  "updated_at": "2025-10-29T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "student_no",
      "message": "Student number already exists"
    }
  ]
}
```

- `403 Forbidden`: Insufficient permissions
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to create students"
}
```

---

### Update Student

Update an existing student record.

```http
PUT /api/students/:id
```

**Authorization:** Admin, Counselor

**Request Body (partial updates allowed):**
```json
{
  "class_level": "10-A",
  "risk_level": "medium",
  "notes": "Showing improvement in academics"
}
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "student_no": "2024-001",
  "name": "Ali Yılmaz",
  "class_level": "10-A",
  "risk_level": "medium",
  "notes": "Showing improvement in academics",
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### Delete Student

Delete a student record (soft delete - marks as inactive).

```http
DELETE /api/students/:id
```

**Authorization:** Admin only

**Example Response (200 OK):**
```json
{
  "message": "Student deleted successfully",
  "id": 150
}
```

**Error Responses:**
- `403 Forbidden`: Only admins can delete students
- `404 Not Found`: Student not found

---

### Get Student Stats

Get statistics for a specific student.

```http
GET /api/students/:id/stats
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "total_exams": 24,
  "average_score": 78.5,
  "total_counseling_sessions": 8,
  "last_session_date": "2025-10-20",
  "risk_assessment": {
    "current_level": "medium",
    "trend": "improving",
    "last_updated": "2025-10-29"
  },
  "academic_performance": {
    "best_subject": "Matematik",
    "best_score": 95,
    "weakest_subject": "Fizik",
    "weakest_score": 62
  }
}
```

---

### Bulk Create Students

Create multiple students at once (used for Excel import).

```http
POST /api/students/bulk
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "students": [
    {
      "student_no": "2024-200",
      "name": "Student 1",
      "class_level": "9-A"
    },
    {
      "student_no": "2024-201",
      "name": "Student 2",
      "class_level": "9-A"
    }
  ]
}
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [
    {
      "id": 200,
      "student_no": "2024-200",
      "status": "created"
    },
    {
      "id": 201,
      "student_no": "2024-201",
      "status": "created"
    }
  ]
}
```

---

### Export Students

Export student data in various formats.

```http
GET /api/students/export
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | Yes | Export format: excel, csv, pdf |
| `class_level` | string | No | Filter by class |
| `fields` | string[] | No | Select fields to export |

**Authorization:** Admin, Counselor

**Example Request:**
```javascript
GET /api/students/export?format=excel&class_level=9-A
```

**Example Response:**
- Returns a file download with appropriate MIME type
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- CSV: `text/csv`
- PDF: `application/pdf`

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [] // Optional validation details
}
```

## Rate Limiting

- **GET requests**: 200 per 15 minutes
- **POST/PUT/DELETE requests**: 50 per 15 minutes

---

**Related Documentation:**
- [API Overview](./README.md)
- [Authentication API](./authentication.md)
- [Analytics API](./analytics.md)

**Last Updated:** October 29, 2025
