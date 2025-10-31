# Career Guidance API

Career profile matching and guidance recommendations.

## Base Path
```
/api/career-guidance
```

## Overview

71 career profiles with AI-powered student-career matching based on interests, skills, and academic performance.

---

## Career Profiles

### List Career Profiles

```http
GET /api/career-guidance/profiles
```

**Authorization:** All roles

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | STEM, Health, Arts, Business, etc. |
| `education_level` | string | high_school, associate, bachelor, master, phd |

**Example Response (200 OK):**
```json
{
  "profiles": [
    {
      "id": 1,
      "title": "Yazılım Mühendisi",
      "category": "STEM",
      "description": "Bilgisayar programları ve sistemleri geliştiren profesyonel",
      "required_skills": ["Problem çözme", "Analitik düşünme", "Matematik"],
      "required_education": "bachelor",
      "employment_outlook": "excellent",
      "average_salary_range": "60,000 - 150,000 TL/ay",
      "work_environment": "Ofis, uzaktan çalışma",
      "related_careers": ["Veri Bilimci", "Sistem Analisti"]
    }
  ]
}
```

---

### Get Student Career Match

AI-powered career recommendations for a student.

```http
GET /api/career-guidance/match/:studentId
```

**Authorization:** All roles

**Example Response (200 OK):**
```json
{
  "student_id": 1,
  "student_name": "Ali Yılmaz",
  "top_matches": [
    {
      "career_id": 1,
      "title": "Yazılım Mühendisi",
      "match_score": 92,
      "reasoning": "Güçlü matematik becerisi, problem çözme yeteneği, teknolojiye ilgi",
      "alignment": {
        "skills": 95,
        "interests": 90,
        "academic": 88
      }
    },
    {
      "career_id": 15,
      "title": "Veri Bilimci",
      "match_score": 88,
      "reasoning": "Analitik düşünme, istatistik becerisi, araştırma ilgisi"
    }
  ]
}
```

---

**Last Updated:** October 29, 2025
