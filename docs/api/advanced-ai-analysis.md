# Advanced AI Analysis API

## 📋 Overview

The Advanced AI Analysis API provides deep psychological analysis capabilities for student profiles, including risk predictions, behavioral patterns, and intervention recommendations.

**Base Path:** `/api/advanced-ai-analysis`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor

---

## 🎯 Endpoints

### 1. Generate Comprehensive Analysis

Generates deep psychological analysis for a student using all available data sources.

**Endpoint:**
```http
POST /api/advanced-ai-analysis/:studentId/comprehensive
```

**Parameters:**
- `studentId` (path, required): Student ID

**Request Body:**
```json
{
  "analysis_type": "psychological_depth",
  "include_predictions": true,
  "include_recommendations": true
}
```

**Response:**
```json
{
  "student_id": 1,
  "analysis": {
    "psychological_depth": {
      "emotional_state": "High anxiety, low self-esteem",
      "behavioral_patterns": ["Withdrawal from social activities", "Academic decline"],
      "underlying_factors": ["Family issues", "Peer pressure"],
      "severity": "moderate"
    },
    "risk_predictions": {
      "academic_risk": {
        "current_level": "medium",
        "predicted_level": "high",
        "timeline": "3 months",
        "confidence": 0.78
      },
      "behavioral_risk": {
        "current_level": "low",
        "predicted_level": "medium",
        "timeline": "2 months",
        "confidence": 0.65
      }
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "intervention",
        "action": "Schedule weekly counseling sessions",
        "rationale": "Student shows signs of increasing anxiety"
      },
      {
        "priority": "medium",
        "category": "family_engagement",
        "action": "Parent meeting to discuss home environment",
        "rationale": "Family dynamics appear to be contributing factor"
      }
    ]
  },
  "generated_at": "2025-10-29T10:00:00.000Z",
  "ai_provider": "gemini-1.5-pro"
}
```

---

### 2. Comparative Multi-Student Analysis

Analyzes and compares multiple students to identify patterns and prioritize interventions.

**Endpoint:**
```http
POST /api/advanced-ai-analysis/comparative
```

**Request Body:**
```json
{
  "student_ids": [1, 2, 3, 4, 5],
  "comparison_criteria": ["risk_level", "academic_performance", "behavioral_patterns"],
  "include_group_insights": true
}
```

**Response:**
```json
{
  "total_students": 5,
  "comparison": [
    {
      "student_id": 1,
      "name": "Ali Yılmaz",
      "risk_score": 85,
      "priority": "urgent",
      "key_concerns": ["Academic decline", "Social withdrawal"]
    },
    {
      "student_id": 3,
      "name": "Ayşe Demir",
      "risk_score": 72,
      "priority": "high",
      "key_concerns": ["Anxiety", "Family issues"]
    }
  ],
  "group_insights": {
    "common_patterns": ["Increased anxiety before exams", "Social media influence"],
    "risk_distribution": {
      "urgent": 1,
      "high": 2,
      "medium": 2,
      "low": 0
    },
    "recommended_group_interventions": [
      "Stress management workshop",
      "Digital wellness program"
    ]
  },
  "generated_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 3. Predictive Risk Timeline

Generates a predictive timeline of risk levels for a student over the next 6 months.

**Endpoint:**
```http
GET /api/advanced-ai-analysis/:studentId/risk-timeline
```

**Parameters:**
- `studentId` (path, required): Student ID
- `months` (query, optional): Number of months to predict (default: 6, max: 12)

**Response:**
```json
{
  "student_id": 1,
  "current_risk_level": "medium",
  "timeline": [
    {
      "month": "November 2025",
      "predicted_risk": "medium",
      "confidence": 0.82,
      "contributing_factors": ["Exam period", "Reduced counseling sessions"]
    },
    {
      "month": "December 2025",
      "predicted_risk": "high",
      "confidence": 0.75,
      "contributing_factors": ["Holiday stress", "Family dynamics"]
    },
    {
      "month": "January 2026",
      "predicted_risk": "high",
      "confidence": 0.71,
      "contributing_factors": ["Academic pressure", "Social isolation"]
    }
  ],
  "intervention_windows": [
    {
      "window": "Now - November 2025",
      "action": "Increase counseling frequency",
      "impact": "Prevent risk escalation"
    }
  ],
  "generated_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 4. Behavioral Pattern Analysis

Analyzes behavioral patterns from counseling sessions, attendance, and academic data.

**Endpoint:**
```http
GET /api/advanced-ai-analysis/:studentId/behavioral-patterns
```

**Parameters:**
- `studentId` (path, required): Student ID
- `time_period` (query, optional): Time period for analysis (30, 60, 90, 180 days)

**Response:**
```json
{
  "student_id": 1,
  "time_period": "90 days",
  "patterns": [
    {
      "pattern_type": "attendance",
      "description": "Increased absenteeism on Mondays",
      "frequency": "60% of Mondays",
      "significance": "high",
      "possible_causes": ["Weekend family conflicts", "Anxiety about week ahead"]
    },
    {
      "pattern_type": "academic",
      "description": "Performance decline in math and science",
      "trend": "consistent_decline",
      "significance": "medium",
      "possible_causes": ["Difficulty understanding concepts", "Lack of motivation"]
    },
    {
      "pattern_type": "social",
      "description": "Withdrawal from group activities",
      "frequency": "increasing",
      "significance": "high",
      "possible_causes": ["Peer conflict", "Social anxiety"]
    }
  ],
  "overall_assessment": "Student shows concerning behavioral patterns requiring immediate intervention",
  "recommended_actions": [
    "Weekly counseling sessions focusing on anxiety management",
    "Parent meeting to discuss Monday absenteeism",
    "Peer support group for social skills"
  ],
  "generated_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 5. AI Insights Dashboard Data

Provides AI-generated insights for dashboard display (school-wide or student-specific).

**Endpoint:**
```http
GET /api/advanced-ai-analysis/insights
```

**Query Parameters:**
- `scope` (optional): `school`, `class`, or `student`
- `student_id` (required if scope=student): Student ID
- `class_level` (required if scope=class): Class level (e.g., "9-A")

**Response (School-wide):**
```json
{
  "scope": "school",
  "generated_at": "2025-10-29T06:00:00.000Z",
  "insights": [
    {
      "type": "urgent_attention",
      "title": "12 Students Need Immediate Intervention",
      "description": "Risk levels have increased for 12 students this week",
      "priority": "urgent",
      "action_url": "/students?risk_level=urgent"
    },
    {
      "type": "trend",
      "title": "Academic Performance Decline in 9th Grade",
      "description": "Average exam scores dropped 15% compared to last month",
      "priority": "high",
      "action_url": "/analytics?class=9"
    },
    {
      "type": "positive",
      "title": "Counseling Session Effectiveness Improving",
      "description": "Students show 25% improvement after AI-assisted sessions",
      "priority": "info"
    }
  ],
  "summary": {
    "total_students_analyzed": 850,
    "high_risk_students": 32,
    "improvement_trend": "+12%"
  }
}
```

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Comprehensive Analysis | ✅ | ✅ | ❌ | ❌ |
| Comparative Analysis | ✅ | ✅ | ❌ | ❌ |
| Risk Timeline | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Behavioral Patterns | ✅ | ✅ | 📖 Read-only | 📖 Read-only |
| Insights Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Error Responses

### Student Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Student with ID 999 not found"
}
```

### Insufficient Data
```json
{
  "error": "INSUFFICIENT_DATA",
  "message": "Not enough data available for comprehensive analysis",
  "details": {
    "required_data": ["counseling_sessions", "exam_results"],
    "missing_data": ["counseling_sessions"]
  }
}
```

### AI Provider Error
```json
{
  "error": "AI_ERROR",
  "message": "AI provider failed to generate analysis",
  "details": "Rate limit exceeded"
}
```

---

## 🎯 Best Practices

1. **Cache Results**: Analysis results are computationally expensive, cache them for 1-6 hours
2. **Batch Processing**: Use comparative analysis for multiple students instead of individual calls
3. **Rate Limiting**: AI analysis endpoints have strict rate limits (30 requests/15 min)
4. **Data Quality**: Ensure sufficient counseling sessions and academic data for accurate analysis
5. **Human Review**: Always have a counselor review AI recommendations before taking action

---

## 📊 Example Use Cases

### Use Case 1: Daily Morning Briefing
```javascript
// Get school-wide insights for counselor's morning briefing
const insights = await fetch('/api/advanced-ai-analysis/insights?scope=school', {
  credentials: 'include'
});
```

### Use Case 2: Student Intervention Planning
```javascript
// Get comprehensive analysis before planning intervention
const analysis = await fetch('/api/advanced-ai-analysis/1/comprehensive', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysis_type: 'psychological_depth',
    include_predictions: true,
    include_recommendations: true
  })
});
```

### Use Case 3: Risk Monitoring
```javascript
// Monitor risk progression over time
const timeline = await fetch('/api/advanced-ai-analysis/1/risk-timeline?months=6', {
  credentials: 'include'
});
```

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** AI Team
