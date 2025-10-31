# Notifications API

## 📋 Overview

The Notifications API manages intelligent notification rules, automated alerts, and notification delivery for counselors and administrators.

**Base Path:** `/api/notifications`

**Authentication:** Required (Session-based)

**Required Roles:** Admin, Counselor

---

## 🎯 Endpoints

### 1. Create Notification Rule

Creates a new automated notification rule.

**Endpoint:**
```http
POST /api/notifications/rules
```

**Request Body:**
```json
{
  "rule_name": "High-Risk Student Alert",
  "description": "Notify when student risk level reaches high or urgent",
  "trigger_type": "risk_level_change",
  "conditions": {
    "risk_level": ["high", "urgent"],
    "change_type": "increased"
  },
  "notification_type": "email",
  "recipients": {
    "roles": ["counselor", "admin"],
    "specific_users": [5, 8]
  },
  "message_template": "Student {{student_name}} ({{student_no}}) risk level increased to {{risk_level}}. Immediate attention required.",
  "priority": "high",
  "enabled": true
}
```

**Response:**
```json
{
  "id": 12,
  "rule_name": "High-Risk Student Alert",
  "description": "Notify when student risk level reaches high or urgent",
  "trigger_type": "risk_level_change",
  "conditions": {
    "risk_level": ["high", "urgent"],
    "change_type": "increased"
  },
  "notification_type": "email",
  "recipients": {
    "roles": ["counselor", "admin"],
    "specific_users": [5, 8]
  },
  "message_template": "Student {{student_name}} ({{student_no}}) risk level increased to {{risk_level}}. Immediate attention required.",
  "priority": "high",
  "enabled": true,
  "created_by": 5,
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

---

### 2. Get Notification Rules

Retrieves all notification rules.

**Endpoint:**
```http
GET /api/notifications/rules
```

**Query Parameters:**
- `enabled` (optional): Filter by enabled status (`true`, `false`)
- `trigger_type` (optional): Filter by trigger type

**Response:**
```json
{
  "total_rules": 8,
  "rules": [
    {
      "id": 12,
      "rule_name": "High-Risk Student Alert",
      "trigger_type": "risk_level_change",
      "priority": "high",
      "enabled": true,
      "notifications_sent": 45,
      "created_at": "2025-10-29T10:00:00.000Z"
    },
    {
      "id": 11,
      "rule_name": "Exam Performance Drop",
      "trigger_type": "exam_result",
      "priority": "medium",
      "enabled": true,
      "notifications_sent": 23,
      "created_at": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get User Notifications

Retrieves notifications for the current user.

**Endpoint:**
```http
GET /api/notifications
```

**Query Parameters:**
- `status` (optional): `unread`, `read`, `all` (default: `all`)
- `priority` (optional): `urgent`, `high`, `medium`, `low`
- `limit` (optional): Number of records (default: 50)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "total_notifications": 125,
  "unread_count": 8,
  "notifications": [
    {
      "id": 456,
      "title": "High-Risk Student Alert",
      "message": "Student Ali Yılmaz (2024-001) risk level increased to high. Immediate attention required.",
      "notification_type": "risk_alert",
      "priority": "high",
      "status": "unread",
      "related_student_id": 1,
      "related_student_name": "Ali Yılmaz",
      "action_url": "/students/1",
      "created_at": "2025-10-29T10:00:00.000Z"
    },
    {
      "id": 455,
      "title": "Exam Performance Drop",
      "message": "Student Ayşe Demir exam score dropped 25% in Mathematics",
      "notification_type": "academic_alert",
      "priority": "medium",
      "status": "read",
      "related_student_id": 2,
      "action_url": "/exams?student_id=2",
      "created_at": "2025-10-28T14:00:00.000Z",
      "read_at": "2025-10-28T15:30:00.000Z"
    }
  ],
  "page": 1,
  "total_pages": 3
}
```

---

### 4. Mark Notification as Read

Marks one or more notifications as read.

**Endpoint:**
```http
PUT /api/notifications/mark-read
```

**Request Body:**
```json
{
  "notification_ids": [456, 457, 458]
}
```

**Response:**
```json
{
  "message": "3 notifications marked as read",
  "marked_count": 3,
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### 5. Send Manual Notification

Sends a manual notification to specific users.

**Endpoint:**
```http
POST /api/notifications/send
```

**Request Body:**
```json
{
  "title": "Important Meeting Reminder",
  "message": "Please attend the counseling team meeting tomorrow at 10:00 AM",
  "notification_type": "announcement",
  "priority": "medium",
  "recipients": {
    "roles": ["counselor"],
    "specific_users": [5, 8, 12]
  },
  "related_student_id": null,
  "action_url": "/meetings/45"
}
```

**Response:**
```json
{
  "message": "Notification sent successfully",
  "recipients_count": 5,
  "notification_ids": [459, 460, 461, 462, 463],
  "sent_at": "2025-10-29T11:00:00.000Z"
}
```

---

### 6. Get Notification Statistics

Retrieves statistics on notifications sent and received.

**Endpoint:**
```http
GET /api/notifications/statistics
```

**Query Parameters:**
- `time_period` (optional): `7d`, `30d`, `90d`, `1y` (default: `30d`)

**Response:**
```json
{
  "time_period": "30 days",
  "statistics": {
    "total_sent": 450,
    "total_received": 125,
    "unread_count": 8,
    "read_count": 117,
    "by_priority": {
      "urgent": 15,
      "high": 45,
      "medium": 52,
      "low": 13
    },
    "by_type": {
      "risk_alert": 32,
      "academic_alert": 28,
      "counseling_reminder": 15,
      "announcement": 20,
      "system": 30
    },
    "response_time": {
      "average_minutes": 45,
      "urgent_average_minutes": 12,
      "high_average_minutes": 30
    }
  },
  "trends": {
    "alerts_trend": "+12% vs previous period",
    "response_time_trend": "-8% faster vs previous period"
  }
}
```

---

### 7. Update Notification Rule

Updates an existing notification rule.

**Endpoint:**
```http
PUT /api/notifications/rules/:ruleId
```

**Parameters:**
- `ruleId` (path, required): Rule ID

**Request Body:**
```json
{
  "enabled": false,
  "priority": "medium",
  "message_template": "Updated: Student {{student_name}} risk level changed to {{risk_level}}"
}
```

**Response:**
```json
{
  "id": 12,
  "rule_name": "High-Risk Student Alert",
  "enabled": false,
  "priority": "medium",
  "updated_at": "2025-10-29T11:00:00.000Z"
}
```

---

### 8. Delete Notification Rule

Deletes a notification rule.

**Endpoint:**
```http
DELETE /api/notifications/rules/:ruleId
```

**Parameters:**
- `ruleId` (path, required): Rule ID

**Response:**
```json
{
  "message": "Notification rule deleted successfully",
  "rule_id": 12,
  "deleted_at": "2025-10-29T11:00:00.000Z"
}
```

---

## 🔔 Notification Types

| Type | Description | Priority |
|------|-------------|----------|
| `risk_alert` | Student risk level changes | High/Urgent |
| `academic_alert` | Academic performance issues | Medium/High |
| `behavioral_alert` | Behavioral concerns | Medium/High |
| `counseling_reminder` | Upcoming counseling sessions | Low/Medium |
| `intervention_due` | Intervention review due | Medium |
| `announcement` | General announcements | Low/Medium |
| `system` | System notifications | Low |

---

## 🎯 Trigger Types

| Trigger | Description | Conditions |
|---------|-------------|------------|
| `risk_level_change` | Risk level changes | risk_level, change_type |
| `exam_result` | Exam performance | score_threshold, change_percentage |
| `attendance` | Attendance issues | absence_count, absence_percentage |
| `counseling_session` | Session scheduled/completed | session_type, days_before |
| `intervention` | Intervention milestones | intervention_status, progress |
| `survey_response` | Survey completed | survey_id, response_threshold |
| `manual` | Manual trigger | N/A |

---

## 🔒 Authorization

| Endpoint | Admin | Counselor | Teacher | Observer |
|----------|-------|-----------|---------|----------|
| Create Rule | ✅ | ✅ | ❌ | ❌ |
| Get Rules | ✅ | ✅ | 📖 Read-only | ❌ |
| Get Notifications | ✅ | ✅ | ✅ | ✅ |
| Mark as Read | ✅ | ✅ | ✅ | ✅ |
| Send Manual | ✅ | ✅ | ❌ | ❌ |
| Get Statistics | ✅ | ✅ | 📖 Read-only | ❌ |
| Update Rule | ✅ | ✅ | ❌ | ❌ |
| Delete Rule | ✅ | ✅ | ❌ | ❌ |

---

## ⚠️ Error Responses

### Rule Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Notification rule with ID 999 not found"
}
```

### Invalid Recipients
```json
{
  "error": "VALIDATION_ERROR",
  "message": "At least one recipient role or user must be specified"
}
```

---

## 🎯 Best Practices

1. **Prioritization**: Use appropriate priority levels to avoid alert fatigue
2. **Actionable**: Include clear action URLs in notifications
3. **Timeliness**: Set reasonable trigger thresholds to catch issues early
4. **Consolidation**: Batch similar notifications to reduce noise
5. **Review**: Regularly review and update notification rules based on effectiveness

---

## 📊 Example Use Cases

### Use Case 1: Create Daily Morning Briefing
```javascript
const rule = await fetch('/api/notifications/rules', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rule_name: 'Daily Morning Briefing',
    trigger_type: 'scheduled',
    schedule: '09:00',
    message_template: 'Good morning! You have {{priority_count}} priority students today.',
    recipients: { roles: ['counselor'] }
  })
});
```

### Use Case 2: Get Unread Notifications
```javascript
const notifications = await fetch('/api/notifications?status=unread&priority=high', {
  credentials: 'include'
});
```

---

**Last Updated:** October 29, 2025  
**API Version:** 2.0.0  
**Maintained by:** Backend Team
