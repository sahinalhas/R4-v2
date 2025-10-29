# Documents API

## 📋 Overview

The Documents API manages file uploads, document storage, and document retrieval for students, counseling sessions, and administrative purposes.

**Base Path:** `/api/documents`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor, Teacher (limited)

---

## 🎯 Endpoints

### 1. Upload Document

Uploads a document and associates it with a student or counseling session.

**Endpoint:**
```http
POST /api/documents/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): File to upload
- `student_id` (optional): Student ID
- `session_id` (optional): Counseling session ID
- `document_type` (required): Document type
- `description` (optional): Document description
- `tags` (optional): Comma-separated tags

**Supported File Types:**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- Images (`.jpg`, `.jpeg`, `.png`)
- Text (`.txt`)

**Maximum File Size:** 10 MB

**Request Example (cURL):**
```bash
curl -X POST 'http://localhost:5000/api/documents/upload' \
  -H 'Cookie: connect.sid=your-session-id' \
  -F 'file=@/path/to/document.pdf' \
  -F 'student_id=1' \
  -F 'document_type=report' \
  -F 'description=Student progress report Q1 2025' \
  -F 'tags=academic,progress,report'
```

**Response:**
```json
{
  "id": 123,
  "filename": "student_report_1_20251029.pdf",
  "original_filename": "progress_report.pdf",
  "file_path": "/uploads/documents/2025/10/student_report_1_20251029.pdf",
  "file_size": 2048576,
  "mime_type": "application/pdf",
  "student_id": 1,
  "session_id": null,
  "document_type": "report",
  "description": "Student progress report Q1 2025",
  "tags": ["academic", "progress", "report"],
  "uploaded_by": 5,
  "uploaded_by_name": "Ahmet Yılmaz",
  "uploaded_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 2. Get Student Documents

Retrieves all documents for a specific student.

**Endpoint:**
```http
GET /api/documents/student/:studentId
```

**Parameters:**
- `studentId` (path, required): Student ID
- `document_type` (query, optional): Filter by type
- `tags` (query, optional): Filter by tags (comma-separated)
- `limit` (query, optional): Number of records (default: 50)
- `page` (query, optional): Page number (default: 1)

**Response:**
```json
{
  "student_id": 1,
  "total_documents": 15,
  "documents": [
    {
      "id": 123,
      "filename": "student_report_1_20251029.pdf",
      "original_filename": "progress_report.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "document_type": "report",
      "description": "Student progress report Q1 2025",
      "tags": ["academic", "progress", "report"],
      "uploaded_by_name": "Ahmet Yılmaz",
      "uploaded_at": "2025-10-29T10:00:00.000Z",
      "download_url": "/api/documents/123/download"
    },
    {
      "id": 122,
      "filename": "counseling_notes_1_20251015.pdf",
      "original_filename": "session_notes.pdf",
      "file_size": 512000,
      "mime_type": "application/pdf",
      "document_type": "counseling_notes",
      "tags": ["counseling", "notes"],
      "uploaded_at": "2025-10-15T10:00:00.000Z",
      "download_url": "/api/documents/122/download"
    }
  ],
  "page": 1,
  "total_pages": 1
}
```

---

### 3. Download Document

Downloads a specific document file.

**Endpoint:**
```http
GET /api/documents/:documentId/download
```

**Parameters:**
- `documentId` (path, required): Document ID

**Response:**
- **Content-Type:** File MIME type
- **Content-Disposition:** `attachment; filename="original_filename.pdf"`
- **Body:** File binary data

**Example (JavaScript):**
```javascript
// Download document
const response = await fetch('/api/documents/123/download', {
  credentials: 'include'
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'progress_report.pdf';
a.click();
```

---

### 4. Get Document Metadata

Retrieves metadata for a specific document.

**Endpoint:**
```http
GET /api/documents/:documentId
```

**Parameters:**
- `documentId` (path, required): Document ID

**Response:**
```json
{
  "id": 123,
  "filename": "student_report_1_20251029.pdf",
  "original_filename": "progress_report.pdf",
  "file_path": "/uploads/documents/2025/10/student_report_1_20251029.pdf",
  "file_size": 2048576,
  "file_size_readable": "2.0 MB",
  "mime_type": "application/pdf",
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "session_id": null,
  "document_type": "report",
  "description": "Student progress report Q1 2025",
  "tags": ["academic", "progress", "report"],
  "uploaded_by": 5,
  "uploaded_by_name": "Ahmet Yılmaz",
  "uploaded_at": "2025-10-29T10:00:00.000Z",
  "download_url": "/api/documents/123/download",
  "preview_available": true
}
```

---

### 5. Update Document Metadata

Updates document metadata (type, description, tags).

**Endpoint:**
```http
PUT /api/documents/:documentId
```

**Parameters:**
- `documentId` (path, required): Document ID

**Request Body:**
```json
{
  "document_type": "academic_report",
  "description": "Updated: Student progress report Q1 2025 - Revised",
  "tags": ["academic", "progress", "report", "q1"]
}
```

**Response:**
```json
{
  "id": 123,
  "document_type": "academic_report",
  "description": "Updated: Student progress report Q1 2025 - Revised",
  "tags": ["academic", "progress", "report", "q1"],
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### 6. Delete Document

Deletes a document from the system.

**Endpoint:**
```http
DELETE /api/documents/:documentId
```

**Parameters:**
- `documentId` (path, required): Document ID

**Response:**
```json
{
  "message": "Document deleted successfully",
  "document_id": 123,
  "deleted_at": "2025-10-29T11:00:00.000Z"
}
```

---

### 7. Bulk Upload Documents

Uploads multiple documents at once.

**Endpoint:**
```http
POST /api/documents/bulk-upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files[]` (required): Multiple files
- `student_id` (required): Student ID
- `document_type` (required): Document type for all files

**Response:**
```json
{
  "total_files": 3,
  "successful_uploads": 3,
  "failed_uploads": 0,
  "documents": [
    {
      "id": 124,
      "filename": "exam_result_1.pdf",
      "file_size": 512000
    },
    {
      "id": 125,
      "filename": "exam_result_2.pdf",
      "file_size": 498000
    },
    {
      "id": 126,
      "filename": "exam_result_3.pdf",
      "file_size": 520000
    }
  ],
  "uploaded_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 8. Search Documents

Searches documents by filename, description, or tags.

**Endpoint:**
```http
GET /api/documents/search
```

**Query Parameters:**
- `query` (required): Search query
- `document_type` (optional): Filter by type
- `student_id` (optional): Filter by student
- `date_from` (optional): Filter by upload date (ISO format)
- `date_to` (optional): Filter by upload date (ISO format)
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "query": "progress report",
  "total_results": 12,
  "documents": [
    {
      "id": 123,
      "filename": "student_report_1_20251029.pdf",
      "student_name": "Ali Yılmaz",
      "document_type": "report",
      "description": "Student progress report Q1 2025",
      "uploaded_at": "2025-10-29T10:00:00.000Z",
      "relevance_score": 0.95
    }
  ]
}
```

---

## 📂 Document Types

| Type | Description | Common Use Cases |
|------|-------------|------------------|
| `report` | Academic/progress reports | Student reports, evaluations |
| `counseling_notes` | Counseling session notes | Session summaries, observations |
| `medical` | Medical documents | Health records, doctor notes |
| `consent` | Consent forms | Parent consent, permissions |
| `assessment` | Assessment results | Psychological assessments |
| `correspondence` | Letters, emails | Parent communication |
| `certificate` | Certificates, awards | Achievement certificates |
| `other` | Miscellaneous | Other documents |

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Upload Document | ✅ | ✅ | ✅ Limited | ❌ |
| Get Documents | ✅ | ✅ | ✅ | 📖 Read-only |
| Download Document | ✅ | ✅ | ✅ | 📖 Read-only |
| Update Metadata | ✅ | ✅ | ❌ | ❌ |
| Delete Document | ✅ | ✅ | ❌ | ❌ |
| Bulk Upload | ✅ | ✅ | ❌ | ❌ |
| Search Documents | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Error Responses

### File Too Large
```json
{
  "error": "FILE_TOO_LARGE",
  "message": "File size exceeds maximum allowed (10 MB)",
  "file_size": 15728640,
  "max_size": 10485760
}
```

### Invalid File Type
```json
{
  "error": "INVALID_FILE_TYPE",
  "message": "File type not supported",
  "mime_type": "application/zip",
  "allowed_types": ["application/pdf", "image/jpeg", "image/png"]
}
```

### Document Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Document with ID 999 not found"
}
```

---

## 🎯 Best Practices

1. **File Naming**: Use descriptive filenames with dates (e.g., `progress_report_2025_Q1.pdf`)
2. **Tags**: Use consistent tags for easy searching and filtering
3. **Security**: Only authorized users can access sensitive documents
4. **Storage**: Regularly archive old documents to free up storage
5. **Backups**: Documents are included in automated database backups

---

## 📊 Example Use Cases

### Use Case 1: Upload Progress Report
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('student_id', '1');
formData.append('document_type', 'report');
formData.append('description', 'Q1 2025 Progress Report');
formData.append('tags', 'academic,progress,report');

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

### Use Case 2: List Student Documents
```javascript
const documents = await fetch('/api/documents/student/1?document_type=report', {
  credentials: 'include'
});
```

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Backend Team
