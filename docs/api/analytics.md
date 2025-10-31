# Analytics API

School-wide analytics, statistics, and insights.

## Base Path
```
/api/analytics
```

## Overview

Real-time analytics for school-wide performance, risk distribution, and trends.

---

## Dashboard Analytics

### Get Dashboard Stats

```http
GET /api/analytics/dashboard
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "overview": {
    "total_students": 850,
    "total_classes": 34,
    "total_counselors": 8,
    "active_surveys": 5
  },
  "risk_distribution": {
    "low": 680,
    "medium": 125,
    "high": 35,
    "critical": 10
  },
  "academic_performance": {
    "avg_exam_score": 72.5,
    "trend": "improving",
    "change_percent": 5.2
  },
  "recent_activity": {
    "sessions_this_week": 45,
    "surveys_completed": 230,
    "new_interventions": 8
  }
}
```

---

### Class Analytics

```http
GET /api/analytics/class/:classLevel
```

**Example Response (200 OK):**
```json
{
  "class_level": "9-A",
  "students_count": 25,
  "risk_distribution": {
    "low": 18,
    "medium": 5,
    "high": 2
  },
  "academic_avg": 75.8,
  "attendance_rate": 92.5,
  "top_concerns": ["Matematik", "Fizik"]
}
```

---

**Last Updated:** October 29, 2025
