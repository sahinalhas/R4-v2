# AI Assistant API

API documentation for the conversational AI assistant feature.

## Base Path
```
/api/ai-assistant
```

## Overview

The AI Assistant is a professional virtual guidance counselor with:
- **Psychological Expertise**: Evidence-based counseling techniques
- **Pedagogical Knowledge**: Educational best practices
- **Pattern Recognition**: Identify trends in student data
- **Multi-Provider Support**: OpenAI, Gemini, Ollama

---

## Chat Endpoints

### Send Message

Send a message to the AI assistant.

```http
POST /api/ai-assistant/chat
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "message": "9-A sınıfında risk seviyesi yüksek olan öğrenciler kimler?",
  "context": {
    "student_id": null,
    "class_level": "9-A",
    "conversation_id": null
  },
  "provider": "gemini"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's question/prompt |
| `context.student_id` | number | No | Focus on specific student |
| `context.class_level` | string | No | Focus on specific class |
| `context.conversation_id` | string | No | Continue existing conversation |
| `provider` | string | No | AI provider: openai, gemini, ollama (default: gemini) |

**Example Response (200 OK):**
```json
{
  "conversation_id": "conv_abc123",
  "message": "9-A sınıfında risk seviyesi yüksek olan 3 öğrenci bulunmaktadır:\n\n1. **Ali Yılmaz (2024-001)**\n   - Risk Seviyesi: Yüksek\n   - Nedenler: Düşük akademik performans, devamsızlık artışı\n   - Önerilen Müdahale: Bireysel rehberlik oturumları\n\n2. **Ayşe Demir (2024-015)**\n   - Risk Seviyesi: Yüksek  \n   - Nedenler: Sosyal izolasyon, davranış sorunları\n   - Önerilen Müdahale: Akran desteği programı\n\n3. **Mehmet Kaya (2024-022)**\n   - Risk Seviyesi: Yüksek\n   - Nedenler: Aile sorunları, motivasyon düşüklüğü\n   - Önerilen Müdahale: Aile görüşmesi + bireysel destek\n\n**Acil Öneri:** Bu öğrenciler için bu hafta içinde bireysel görüşmeler planlanmalıdır.",
  "data_sources": [
    "students table",
    "risk_assessments table", 
    "counseling_sessions history"
  ],
  "confidence": 0.95,
  "provider_used": "gemini",
  "tokens_used": 450,
  "response_time_ms": 1250
}
```

---

### Get Conversation History

Retrieve conversation history.

```http
GET /api/ai-assistant/conversations/:conversationId
```

**Authorization:** Admin, Counselor

**Example Response (200 OK):**
```json
{
  "conversation_id": "conv_abc123",
  "started_at": "2025-10-29T10:00:00.000Z",
  "last_message_at": "2025-10-29T10:15:00.000Z",
  "messages": [
    {
      "role": "user",
      "content": "9-A sınıfında risk seviyesi yüksek olan öğrenciler kimler?",
      "timestamp": "2025-10-29T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "9-A sınıfında risk seviyesi yüksek olan 3 öğrenci bulunmaktadır...",
      "timestamp": "2025-10-29T10:00:02.000Z"
    },
    {
      "role": "user",
      "content": "Ali Yılmaz için detaylı analiz yapabilir misin?",
      "timestamp": "2025-10-29T10:15:00.000Z"
    }
  ],
  "total_messages": 3
}
```

---

### Student-Specific Query

Ask AI about a specific student.

```http
POST /api/ai-assistant/student/:studentId/analyze
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "query": "Bu öğrenci için hangi müdahale stratejilerini önerirsiniz?",
  "include_data": {
    "exams": true,
    "sessions": true,
    "surveys": true,
    "behavior": true
  }
}
```

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "analysis": {
    "summary": "Ali Yılmaz için kapsamlı bir müdahale planı öneriyorum...",
    "recommendations": [
      {
        "type": "academic",
        "priority": "high",
        "action": "Matematik ve Fizik derslerinde birebir ek destek sağlanmalı",
        "timeline": "2 hafta içinde başlanmalı",
        "expected_outcome": "Net puan artışı: 5-10 net"
      },
      {
        "type": "behavioral",
        "priority": "medium",
        "action": "Haftalık motivasyon görüşmeleri",
        "timeline": "Hemen başlanmalı",
        "expected_outcome": "Devamsızlık oranında %50 azalma"
      }
    ],
    "risk_factors": [
      "Düşük akademik performans (son 3 sınavda ortalama %35 azalma)",
      "Devamsızlık artışı (son ayda 8 gün)",
      "Sosyal çekilme (arkadaş gruplarından uzaklaşma)"
    ],
    "strengths": [
      "Güçlü görsel-uzaysal zeka",
      "Sanat ve yaratıcı aktivitelere ilgi",
      "Ailenin destekleyici tutumu"
    ]
  },
  "confidence": 0.92,
  "data_sources": [
    "24 exam results",
    "8 counseling sessions",
    "5 behavior reports",
    "2 survey responses"
  ]
}
```

---

### Get Daily Insights

Get AI-generated daily insights for all students.

```http
GET /api/ai-assistant/insights/daily
```

**Authorization:** Admin, Counselor

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | Date for insights (YYYY-MM-DD, default: today) |
| `class_level` | string | Filter by class |

**Example Response (200 OK):**
```json
{
  "date": "2025-10-29",
  "generated_at": "2025-10-29T09:00:00.000Z",
  "school_overview": {
    "total_students": 850,
    "high_risk_students": 23,
    "new_risk_alerts": 5,
    "positive_trends": 12
  },
  "priority_students": [
    {
      "student_id": 1,
      "student_name": "Ali Yılmaz",
      "urgency": "high",
      "reason": "3 consecutive absences + declining exam performance",
      "suggested_action": "Immediate parent contact + individual counseling"
    }
  ],
  "class_insights": [
    {
      "class_level": "9-A",
      "trend": "improving",
      "highlights": [
        "Average exam performance up 8%",
        "No new behavioral incidents this week"
      ],
      "concerns": [
        "3 students with increasing absences"
      ]
    }
  ],
  "recommended_actions": [
    "Schedule parent-teacher meeting for 9-B class (behavior concerns)",
    "Organize study skills workshop for 10-A (exam anxiety)",
    "Follow up with 5 students who missed counseling appointments"
  ]
}
```

---

### Generate Action Plan

Generate a structured daily action plan.

```http
POST /api/ai-assistant/action-plan
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "date": "2025-10-30",
  "priorities": ["high_risk_students", "upcoming_exams", "pending_interventions"],
  "time_slots": [
    { "start": "08:00", "end": "09:00" },
    { "start": "09:00", "end": "10:00" },
    { "start": "10:00", "end": "11:00" }
  ]
}
```

**Example Response (200 OK):**
```json
{
  "date": "2025-10-30",
  "total_tasks": 8,
  "schedule": [
    {
      "time": "08:00-09:00",
      "task": "Individual counseling: Ali Yılmaz",
      "priority": "high",
      "type": "counseling",
      "student_id": 1,
      "preparation": [
        "Review last 3 exam results",
        "Check recent behavioral reports",
        "Prepare motivational strategies"
      ]
    },
    {
      "time": "09:00-09:30",
      "task": "Parent phone call: Ayşe Demir's mother",
      "priority": "high",
      "type": "parent_contact",
      "student_id": 15,
      "talking_points": [
        "Discuss recent social isolation",
        "Suggest family counseling",
        "Coordinate intervention plan"
      ]
    }
  ],
  "notes": [
    "3 high-risk students require attention today",
    "TYT exam results to be announced - be available for student reactions",
    "Weekly team meeting at 14:00"
  ]
}
```

---

### Bulk Student Analysis

Analyze multiple students at once.

```http
POST /api/ai-assistant/bulk-analyze
```

**Authorization:** Admin, Counselor

**Request Body:**
```json
{
  "student_ids": [1, 2, 3, 15, 22],
  "analysis_type": "comparative",
  "include_recommendations": true
}
```

**Example Response (200 OK):**
```json
{
  "total_students": 5,
  "analysis": {
    "common_patterns": [
      "All 5 students show declining exam performance trend",
      "4 out of 5 have increased absence rates",
      "Social-emotional challenges observed in 3 students"
    ],
    "comparative_insights": [
      {
        "category": "academic",
        "observation": "Students 1, 2, and 3 struggle most with STEM subjects",
        "recommendation": "Group study sessions for math/physics"
      }
    ],
    "individual_summaries": [
      {
        "student_id": 1,
        "name": "Ali Yılmaz",
        "risk_level": "high",
        "key_issues": ["academic decline", "absence"],
        "priority_actions": ["immediate counseling", "parent meeting"]
      }
    ]
  }
}
```

---

## Configuration Endpoints

### Get AI Settings

```http
GET /api/ai-assistant/settings
```

**Example Response (200 OK):**
```json
{
  "active_provider": "gemini",
  "available_providers": {
    "openai": {
      "status": "configured",
      "model": "gpt-4o-mini"
    },
    "gemini": {
      "status": "active",
      "model": "gemini-1.5-flash"
    },
    "ollama": {
      "status": "unavailable",
      "reason": "No local Ollama server detected"
    }
  }
}
```

---

### Update AI Settings

```http
PUT /api/ai-assistant/settings
```

**Request Body:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.7
}
```

---

## Rate Limiting

AI endpoints have stricter rate limits:
- **30 requests** per 15 minutes
- Higher limits available for admin users

---

**Related Documentation:**
- [API Overview](./README.md)
- [Advanced AI Analysis API](./advanced-ai-analysis.md)
- [AI Suggestions API](./ai-suggestions.md)

**Last Updated:** October 29, 2025
