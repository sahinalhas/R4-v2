# Risk Assessment API

## 📋 Overview

The Risk Assessment API manages comprehensive risk evaluation for students across academic, behavioral, and social-emotional dimensions, including automated risk detection and intervention tracking.

**Base Path:** `/api/risk-assessment`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor

---

## 🎯 Endpoints

### 1. Create Risk Assessment

Creates a new risk assessment for a student.

**Endpoint:**
```http
POST /api/risk-assessment
```

**Request Body:**
```json
{
  "student_id": 1,
  "assessment_type": "comprehensive",
  "academic_risk": {
    "level": "medium",
    "factors": ["declining_grades", "poor_attendance"],
    "details": "Math and science grades dropped 20% this semester"
  },
  "behavioral_risk": {
    "level": "low",
    "factors": ["minor_disruptions"],
    "details": "Occasional talking in class"
  },
  "social_emotional_risk": {
    "level": "high",
    "factors": ["anxiety", "social_withdrawal", "peer_conflict"],
    "details": "Student reports feeling isolated and anxious"
  },
  "overall_risk_level": "high",
  "intervention_required": true,
  "assessor_notes": "Immediate counseling recommended. Family meeting needed.",
  "assessed_by": 5
}
```

**Response:**
```json
{
  "id": 123,
  "student_id": 1,
  "assessment_type": "comprehensive",
  "academic_risk": {
    "level": "medium",
    "factors": ["declining_grades", "poor_attendance"],
    "details": "Math and science grades dropped 20% this semester"
  },
  "behavioral_risk": {
    "level": "low",
    "factors": ["minor_disruptions"],
    "details": "Occasional talking in class"
  },
  "social_emotional_risk": {
    "level": "high",
    "factors": ["anxiety", "social_withdrawal", "peer_conflict"],
    "details": "Student reports feeling isolated and anxious"
  },
  "overall_risk_level": "high",
  "intervention_required": true,
  "assessor_notes": "Immediate counseling recommended. Family meeting needed.",
  "assessed_by": 5,
  "assessed_at": "2025-10-29T10:00:00.000Z",
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 2. Get Student Risk Assessments

Retrieves all risk assessments for a student, ordered by date.

**Endpoint:**
```http
GET /api/risk-assessment/student/:studentId
```

**Parameters:**
- `studentId` (path, required): Student ID
- `limit` (query, optional): Number of records (default: 20)
- `assessment_type` (query, optional): Filter by type (`comprehensive`, `quick`, `follow_up`)

**Response:**
```json
{
  "student_id": 1,
  "total_assessments": 8,
  "current_risk_level": "high",
  "risk_trend": "increasing",
  "assessments": [
    {
      "id": 123,
      "assessment_type": "comprehensive",
      "overall_risk_level": "high",
      "academic_risk": { "level": "medium" },
      "behavioral_risk": { "level": "low" },
      "social_emotional_risk": { "level": "high" },
      "intervention_required": true,
      "assessed_at": "2025-10-29T10:00:00.000Z",
      "assessed_by_name": "Ahmet Yılmaz"
    },
    {
      "id": 122,
      "assessment_type": "follow_up",
      "overall_risk_level": "medium",
      "assessed_at": "2025-10-22T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Current Risk Level

Retrieves the current risk level and latest assessment for a student.

**Endpoint:**
```http
GET /api/risk-assessment/student/:studentId/current
```

**Parameters:**
- `studentId` (path, required): Student ID

**Response:**
```json
{
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "current_risk_level": "high",
  "risk_trend": "increasing",
  "last_assessment": {
    "id": 123,
    "assessment_type": "comprehensive",
    "overall_risk_level": "high",
    "academic_risk": { "level": "medium", "score": 65 },
    "behavioral_risk": { "level": "low", "score": 25 },
    "social_emotional_risk": { "level": "high", "score": 85 },
    "overall_score": 72,
    "intervention_required": true,
    "assessed_at": "2025-10-29T10:00:00.000Z",
    "assessed_by_name": "Ahmet Yılmaz"
  },
  "risk_factors": [
    "Social withdrawal",
    "Anxiety symptoms",
    "Declining academic performance",
    "Poor attendance"
  ],
  "recommended_interventions": [
    "Weekly counseling sessions",
    "Family meeting",
    "Peer support group"
  ]
}
```

---

### 4. Bulk Risk Assessment

Performs automated risk assessment for multiple students using available data.

**Endpoint:**
```http
POST /api/risk-assessment/bulk
```

**Request Body:**
```json
{
  "student_ids": [1, 2, 3, 4, 5],
  "use_ai_analysis": true,
  "assessment_type": "quick"
}
```

**Response:**
```json
{
  "total_students": 5,
  "assessments_created": 5,
  "results": [
    {
      "student_id": 1,
      "status": "completed",
      "assessment_id": 124,
      "risk_level": "high"
    },
    {
      "student_id": 2,
      "status": "completed",
      "assessment_id": 125,
      "risk_level": "medium"
    },
    {
      "student_id": 3,
      "status": "completed",
      "assessment_id": 126,
      "risk_level": "low"
    }
  ],
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 5. Risk Distribution Analytics

Gets risk level distribution across the school or specific class.

**Endpoint:**
```http
GET /api/risk-assessment/analytics/distribution
```

**Query Parameters:**
- `class_level` (optional): Filter by class (e.g., "9-A")
- `risk_type` (optional): `academic`, `behavioral`, `social_emotional`, or `overall`
- `time_period` (optional): `7d`, `30d`, `90d`, `1y`

**Response:**
```json
{
  "scope": "school",
  "total_students": 850,
  "assessed_students": 820,
  "risk_type": "overall",
  "distribution": {
    "urgent": {
      "count": 32,
      "percentage": 3.8,
      "trend": "+5 from last week"
    },
    "high": {
      "count": 85,
      "percentage": 10.0,
      "trend": "+12 from last week"
    },
    "medium": {
      "count": 245,
      "percentage": 29.0,
      "trend": "-3 from last week"
    },
    "low": {
      "count": 458,
      "percentage": 54.2,
      "trend": "-14 from last week"
    },
    "not_assessed": {
      "count": 30,
      "percentage": 3.0
    }
  },
  "trends": {
    "overall_trend": "increasing_risk",
    "areas_of_concern": [
      "9th grade social-emotional risk increased 15%",
      "Academic risk rising in STEM subjects"
    ]
  },
  "generated_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 6. Update Risk Assessment

Updates an existing risk assessment.

**Endpoint:**
```http
PUT /api/risk-assessment/:assessmentId
```

**Parameters:**
- `assessmentId` (path, required): Assessment ID

**Request Body:**
```json
{
  "overall_risk_level": "medium",
  "social_emotional_risk": {
    "level": "medium",
    "factors": ["anxiety"],
    "details": "Anxiety improving with counseling"
  },
  "assessor_notes": "Student responding well to interventions. Continue weekly sessions.",
  "intervention_required": true
}
```

**Response:**
```json
{
  "id": 123,
  "student_id": 1,
  "overall_risk_level": "medium",
  "social_emotional_risk": {
    "level": "medium",
    "factors": ["anxiety"],
    "details": "Anxiety improving with counseling"
  },
  "assessor_notes": "Student responding well to interventions. Continue weekly sessions.",
  "updated_at": "2025-10-29T10:00:00.000Z"
}
```

---

## 📊 Risk Level Definitions

| Level | Score Range | Description | Action Required |
|-------|-------------|-------------|-----------------|
| **Urgent** | 90-100 | Immediate crisis or severe risk | Immediate intervention, crisis response |
| **High** | 70-89 | Significant risk requiring attention | Weekly counseling, intervention plan |
| **Medium** | 40-69 | Moderate risk, monitor closely | Bi-weekly check-ins, support plan |
| **Low** | 0-39 | Minimal risk, routine monitoring | Regular monitoring, preventive measures |

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Create Assessment | ✅ | ✅ | ❌ | ❌ |
| Get Assessments | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Get Current Risk | ✅ | ✅ | ✅ | ✅ |
| Bulk Assessment | ✅ | ✅ | ❌ | ❌ |
| Distribution Analytics | ✅ | ✅ | ✅ | ✅ |
| Update Assessment | ✅ | ✅ | ❌ | ❌ |

---

## ⚠️ Error Responses

### Invalid Risk Level
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid risk level",
  "details": "Risk level must be one of: urgent, high, medium, low"
}
```

### Assessment Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Risk assessment with ID 999 not found"
}
```

---

## 🎯 Best Practices

1. **Regular Assessments**: Conduct comprehensive assessments monthly, quick assessments weekly
2. **Trend Monitoring**: Track risk trends over time to identify patterns
3. **Early Intervention**: Act on medium-risk students before they escalate to high-risk
4. **Data-Driven**: Use AI-assisted bulk assessments for objective analysis
5. **Follow-Up**: Schedule follow-up assessments 2 weeks after interventions

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Risk Assessment Team
