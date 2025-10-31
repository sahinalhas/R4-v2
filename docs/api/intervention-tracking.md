# Intervention Tracking API

## 📋 Overview

The Intervention Tracking API manages intervention plans, tracks progress, and monitors the effectiveness of counseling interventions for at-risk students.

**Base Path:** `/api/interventions`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor

---

## 🎯 Endpoints

### 1. Create Intervention Plan

Creates a new intervention plan for a student.

**Endpoint:**
```http
POST /api/interventions
```

**Request Body:**
```json
{
  "student_id": 1,
  "intervention_type": "counseling",
  "risk_level": "high",
  "target_area": "social_emotional",
  "goals": [
    "Reduce anxiety symptoms",
    "Improve peer relationships",
    "Increase class participation"
  ],
  "actions": [
    {
      "action": "Weekly individual counseling sessions",
      "frequency": "weekly",
      "responsible": "School Counselor",
      "duration_weeks": 8
    },
    {
      "action": "Parent meetings to discuss support strategies",
      "frequency": "bi-weekly",
      "responsible": "School Counselor + Parent",
      "duration_weeks": 8
    },
    {
      "action": "Peer support group participation",
      "frequency": "weekly",
      "responsible": "School Counselor",
      "duration_weeks": 8
    }
  ],
  "success_criteria": [
    "Student reports reduced anxiety (self-assessment score < 5)",
    "Improved attendance (>90%)",
    "Active participation in at least one group activity per week"
  ],
  "review_date": "2025-12-29",
  "created_by": 5
}
```

**Response:**
```json
{
  "id": 45,
  "student_id": 1,
  "intervention_type": "counseling",
  "risk_level": "high",
  "target_area": "social_emotional",
  "status": "active",
  "goals": [
    "Reduce anxiety symptoms",
    "Improve peer relationships",
    "Increase class participation"
  ],
  "actions": [
    {
      "action": "Weekly individual counseling sessions",
      "frequency": "weekly",
      "responsible": "School Counselor",
      "duration_weeks": 8,
      "completed_sessions": 0
    }
  ],
  "success_criteria": [
    "Student reports reduced anxiety (self-assessment score < 5)",
    "Improved attendance (>90%)",
    "Active participation in at least one group activity per week"
  ],
  "progress": 0,
  "review_date": "2025-12-29",
  "created_by": 5,
  "created_by_name": "Ahmet Yılmaz",
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 2. Get Student Interventions

Retrieves all interventions for a student.

**Endpoint:**
```http
GET /api/interventions/student/:studentId
```

**Parameters:**
- `studentId` (path, required): Student ID
- `status` (query, optional): Filter by status (`active`, `completed`, `paused`)

**Response:**
```json
{
  "student_id": 1,
  "total_interventions": 5,
  "active_interventions": 2,
  "interventions": [
    {
      "id": 45,
      "intervention_type": "counseling",
      "target_area": "social_emotional",
      "status": "active",
      "progress": 25,
      "goals_achieved": 1,
      "total_goals": 3,
      "review_date": "2025-12-29",
      "created_at": "2025-10-29T10:00:00.000Z",
      "created_by_name": "Ahmet Yılmaz"
    },
    {
      "id": 44,
      "intervention_type": "academic_support",
      "target_area": "academic",
      "status": "completed",
      "progress": 100,
      "goals_achieved": 4,
      "total_goals": 4,
      "completed_at": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Update Intervention Progress

Updates the progress of an intervention with notes and milestone achievements.

**Endpoint:**
```http
PUT /api/interventions/:interventionId/progress
```

**Parameters:**
- `interventionId` (path, required): Intervention ID

**Request Body:**
```json
{
  "progress_percentage": 50,
  "goals_achieved": [
    {
      "goal": "Reduce anxiety symptoms",
      "achieved": true,
      "achievement_date": "2025-11-15",
      "notes": "Student reports feeling much calmer, anxiety score reduced to 3"
    }
  ],
  "actions_completed": [
    {
      "action": "Weekly individual counseling sessions",
      "completed_count": 4,
      "effectiveness": "high",
      "notes": "Sessions going well, student engaged and responsive"
    }
  ],
  "progress_notes": "Significant improvement in anxiety management. Student participating more in class.",
  "next_steps": "Continue weekly sessions, introduce stress management techniques"
}
```

**Response:**
```json
{
  "id": 45,
  "student_id": 1,
  "progress_percentage": 50,
  "goals_achieved": 1,
  "total_goals": 3,
  "status": "active",
  "last_progress_update": {
    "updated_at": "2025-11-15T10:00:00.000Z",
    "updated_by_name": "Ahmet Yılmaz",
    "progress_notes": "Significant improvement in anxiety management. Student participating more in class.",
    "next_steps": "Continue weekly sessions, introduce stress management techniques"
  }
}
```

---

### 4. Get Intervention Details

Retrieves detailed information about a specific intervention.

**Endpoint:**
```http
GET /api/interventions/:interventionId
```

**Parameters:**
- `interventionId` (path, required): Intervention ID

**Response:**
```json
{
  "id": 45,
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "intervention_type": "counseling",
  "risk_level": "high",
  "target_area": "social_emotional",
  "status": "active",
  "goals": [
    {
      "goal": "Reduce anxiety symptoms",
      "achieved": true,
      "achievement_date": "2025-11-15"
    },
    {
      "goal": "Improve peer relationships",
      "achieved": false,
      "progress_notes": "Some improvement, needs more time"
    },
    {
      "goal": "Increase class participation",
      "achieved": false,
      "progress_notes": "Student starting to participate more"
    }
  ],
  "actions": [
    {
      "action": "Weekly individual counseling sessions",
      "frequency": "weekly",
      "completed_count": 4,
      "total_planned": 8,
      "effectiveness": "high"
    }
  ],
  "progress_percentage": 50,
  "success_criteria": [
    "Student reports reduced anxiety (self-assessment score < 5)",
    "Improved attendance (>90%)",
    "Active participation in at least one group activity per week"
  ],
  "progress_updates": [
    {
      "update_date": "2025-11-15T10:00:00.000Z",
      "progress_notes": "Significant improvement in anxiety management",
      "updated_by": "Ahmet Yılmaz"
    }
  ],
  "review_date": "2025-12-29",
  "created_at": "2025-10-29T10:00:00.000Z",
  "created_by_name": "Ahmet Yılmaz"
}
```

---

### 5. Complete Intervention

Marks an intervention as completed with final outcomes.

**Endpoint:**
```http
POST /api/interventions/:interventionId/complete
```

**Parameters:**
- `interventionId` (path, required): Intervention ID

**Request Body:**
```json
{
  "completion_status": "successful",
  "goals_achieved": 3,
  "total_goals": 3,
  "final_notes": "All goals successfully achieved. Student anxiety reduced, peer relationships improved, active class participation.",
  "outcomes": [
    "Anxiety score reduced from 8 to 2",
    "Attendance improved to 95%",
    "Participating in 2 group activities per week"
  ],
  "recommendations": [
    "Continue monthly check-ins for 3 months",
    "Monitor for any regression",
    "Encourage continued participation in peer support group"
  ]
}
```

**Response:**
```json
{
  "id": 45,
  "student_id": 1,
  "status": "completed",
  "completion_status": "successful",
  "progress_percentage": 100,
  "goals_achieved": 3,
  "total_goals": 3,
  "final_notes": "All goals successfully achieved. Student anxiety reduced, peer relationships improved, active class participation.",
  "outcomes": [
    "Anxiety score reduced from 8 to 2",
    "Attendance improved to 95%",
    "Participating in 2 group activities per week"
  ],
  "recommendations": [
    "Continue monthly check-ins for 3 months",
    "Monitor for any regression",
    "Encourage continued participation in peer support group"
  ],
  "completed_at": "2025-12-29T10:00:00.000Z",
  "completed_by_name": "Ahmet Yılmaz"
}
```

---

### 6. Intervention Analytics

Gets analytics on intervention effectiveness across the school.

**Endpoint:**
```http
GET /api/interventions/analytics
```

**Query Parameters:**
- `time_period` (optional): `30d`, `90d`, `1y` (default: `90d`)
- `intervention_type` (optional): Filter by type
- `target_area` (optional): `academic`, `behavioral`, `social_emotional`

**Response:**
```json
{
  "time_period": "90 days",
  "total_interventions": 120,
  "active_interventions": 45,
  "completed_interventions": 75,
  "statistics": {
    "success_rate": 82,
    "average_duration_days": 56,
    "average_progress": 78
  },
  "by_type": {
    "counseling": {
      "count": 68,
      "success_rate": 85,
      "average_duration": 60
    },
    "academic_support": {
      "count": 35,
      "success_rate": 77,
      "average_duration": 45
    },
    "behavioral": {
      "count": 17,
      "success_rate": 82,
      "average_duration": 70
    }
  },
  "by_target_area": {
    "social_emotional": {
      "count": 65,
      "success_rate": 83
    },
    "academic": {
      "count": 38,
      "success_rate": 79
    },
    "behavioral": {
      "count": 17,
      "success_rate": 82
    }
  },
  "trends": {
    "intervention_volume": "increasing",
    "success_rate_trend": "+5% vs previous period"
  }
}
```

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Create Intervention | ✅ | ✅ | ❌ | ❌ |
| Get Interventions | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Update Progress | ✅ | ✅ | ❌ | ❌ |
| Get Details | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Complete Intervention | ✅ | ✅ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Best Practices

1. **SMART Goals**: Set Specific, Measurable, Achievable, Relevant, Time-bound goals
2. **Regular Updates**: Update progress at least bi-weekly
3. **Evidence-Based**: Track concrete outcomes and metrics
4. **Collaboration**: Involve parents, teachers, and students in intervention planning
5. **Follow-Up**: Schedule follow-up check-ins after completion

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Intervention Team
