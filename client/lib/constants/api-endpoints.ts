/**
 * API Endpoints Constants
 * Centralized API endpoint definitions
 */

const API_BASE = '/api';

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE}/users/login`,
  REGISTER: `${API_BASE}/users`,
  LOGOUT: `${API_BASE}/session/logout`,
  SESSION: `${API_BASE}/session`,
  DEMO_USER: `${API_BASE}/session/demo-user`,
} as const;

/**
 * User Endpoints
 */
export const USER_ENDPOINTS = {
  BASE: `${API_BASE}/users`,
  BY_ID: (id: string) => `${API_BASE}/users/${id}`,
  LOGIN: AUTH_ENDPOINTS.LOGIN,
  PASSWORD: (id: string) => `${API_BASE}/users/${id}/password`,
  COUNT: `${API_BASE}/users/count`,
} as const;

/**
 * Student Endpoints
 */
export const STUDENT_ENDPOINTS = {
  BASE: `${API_BASE}/students`,
  BY_ID: (id: string) => `${API_BASE}/students/${id}`,
  BULK: `${API_BASE}/students/bulk`,
  ACADEMICS: (id: string) => `${API_BASE}/students/${id}/academics`,
} as const;

/**
 * Survey Endpoints
 */
export const SURVEY_ENDPOINTS = {
  TEMPLATES: `${API_BASE}/survey-templates`,
  TEMPLATE_BY_ID: (id: string) => `${API_BASE}/survey-templates/${id}`,
  QUESTIONS: (templateId: string) => `${API_BASE}/survey-questions/${templateId}`,
  QUESTION_BY_ID: (id: string) => `${API_BASE}/survey-questions/${id}`,
  DISTRIBUTIONS: `${API_BASE}/survey-distributions`,
  DISTRIBUTION_BY_ID: (id: string) => `${API_BASE}/survey-distributions/${id}`,
  DISTRIBUTION_BY_LINK: (publicLink: string) => `${API_BASE}/survey-distributions/link/${publicLink}`,
  RESPONSES: `${API_BASE}/survey-responses`,
  RESPONSE_BY_ID: (id: string) => `${API_BASE}/survey-responses/${id}`,
  RESPONSE_IMPORT: (distributionId: string) => `${API_BASE}/survey-responses/import/${distributionId}`,
  ANALYTICS: (distributionId: string) => `${API_BASE}/survey-analytics/${distributionId}`,
  QUESTION_ANALYTICS: (distributionId: string, questionId: string) => `${API_BASE}/survey-analytics/${distributionId}/question/${questionId}`,
  STATISTICS: (distributionId: string) => `${API_BASE}/survey-statistics/${distributionId}`,
  AI_ANALYSIS: (distributionId: string) => `${API_BASE}/surveys/ai-analysis/analyze/${distributionId}`,
  AI_CLASS_COMPARISON: `${API_BASE}/surveys/ai-analysis/compare-classes`,
  AI_TRENDS: (templateId: string) => `${API_BASE}/surveys/ai-analysis/trends/${templateId}`,
} as const;

/**
 * Counseling Endpoints
 */
export const COUNSELING_ENDPOINTS = {
  BASE: `${API_BASE}/counseling-sessions`,
  SESSIONS: `${API_BASE}/counseling-sessions/sessions`,
  BY_ID: (id: string) => `${API_BASE}/counseling-sessions/${id}`,
  COMPLETE: (id: string) => `${API_BASE}/counseling-sessions/${id}/complete`,
  EXTEND: (id: string) => `${API_BASE}/counseling-sessions/${id}/extend`,
  TOPICS: `${API_BASE}/counseling-sessions/topics`,
  REMINDERS: `${API_BASE}/counseling-sessions/reminders`,
  REMINDER_BY_ID: (id: string) => `${API_BASE}/counseling-sessions/reminders/${id}`,
  FOLLOW_UPS: `${API_BASE}/counseling-sessions/follow-ups`,
  OUTCOMES: `${API_BASE}/counseling-sessions/outcomes`,
} as const;

/**
 * AI Endpoints
 */
export const AI_ENDPOINTS = {
  CHAT: `${API_BASE}/ai-assistant/chat-stream`,
  MODELS: `${API_BASE}/ai-assistant/models`,
  SET_PROVIDER: `${API_BASE}/ai-assistant/set-provider`,
  ANALYZE_RISK: `${API_BASE}/ai-assistant/analyze-risk`,
  DAILY_INSIGHTS: `${API_BASE}/daily-insights/today`,
  GENERATE_INSIGHTS: `${API_BASE}/daily-insights/generate`,
} as const;

/**
 * Backup Endpoints
 */
export const BACKUP_ENDPOINTS = {
  CREATE: `${API_BASE}/backup/create`,
  LIST: `${API_BASE}/backup/list`,
  RESTORE: (id: string) => `${API_BASE}/backup/restore/${id}`,
  DELETE: (id: string) => `${API_BASE}/backup/${id}`,
  AUDIT_LOGS: `${API_BASE}/backup/audit-logs`,
  ENCRYPT: `${API_BASE}/backup/encrypt`,
  DECRYPT: `${API_BASE}/backup/decrypt`,
} as const;

/**
 * Analytics Endpoints
 */
export const ANALYTICS_ENDPOINTS = {
  OVERVIEW: `${API_BASE}/analytics/overview`,
  BULK_AI: `${API_BASE}/analytics/bulk-ai/school-wide`,
  EARLY_WARNING: `${API_BASE}/analytics/bulk-ai/early-warning`,
  CACHE_INVALIDATE: `${API_BASE}/analytics/cache/invalidate`,
} as const;

/**
 * Advanced AI Analysis Endpoints
 */
export const ADVANCED_AI_ENDPOINTS = {
  PSYCHOLOGICAL: (studentId: string) => `${API_BASE}/advanced-ai-analysis/psychological/${studentId}`,
  PREDICTIVE_TIMELINE: (studentId: string) => `${API_BASE}/advanced-ai-analysis/predictive-timeline/${studentId}`,
  DAILY_ACTION_PLAN: `${API_BASE}/advanced-ai-analysis/daily-action-plan`,
  STUDENT_TIMELINE: (studentId: string) => `${API_BASE}/advanced-ai-analysis/student-timeline/${studentId}`,
  COMPARATIVE_CLASS: (classId: string) => `${API_BASE}/advanced-ai-analysis/comparative-class/${classId}`,
  COMPARATIVE_STUDENTS: `${API_BASE}/advanced-ai-analysis/comparative-students`,
  COMPREHENSIVE: (studentId: string) => `${API_BASE}/advanced-ai-analysis/comprehensive/${studentId}`,
} as const;

/**
 * Profile Sync Endpoints
 */
export const PROFILE_SYNC_ENDPOINTS = {
  IDENTITY: (studentId: string) => `${API_BASE}/profile-sync/identity/${studentId}`,
  IDENTITIES: `${API_BASE}/profile-sync/identities`,
  REFRESH: (studentId: string) => `${API_BASE}/profile-sync/identity/${studentId}/refresh`,
  UPDATE: `${API_BASE}/profile-sync/update`,
  LOGS_BY_STUDENT: (studentId: string) => `${API_BASE}/profile-sync/logs/student/${studentId}`,
  LOGS_BY_SOURCE: (source: string) => `${API_BASE}/profile-sync/logs/source/${source}`,
  CONFLICTS_PENDING: `${API_BASE}/profile-sync/conflicts/pending`,
  CONFLICTS_BY_STUDENT: (studentId: string) => `${API_BASE}/profile-sync/conflicts/student/${studentId}`,
  CONFLICTS_RESOLVE: `${API_BASE}/profile-sync/conflicts/resolve`,
  CONFLICTS_BULK_RESOLVE: `${API_BASE}/profile-sync/conflicts/bulk-resolve`,
  STATISTICS: `${API_BASE}/profile-sync/statistics`,
  CORRECTION: `${API_BASE}/profile-sync/correction`,
  CORRECTIONS: (studentId: string) => `${API_BASE}/profile-sync/corrections/${studentId}`,
  UNDO: `${API_BASE}/profile-sync/undo`,
  CLASS_SUMMARY: (classId: string) => `${API_BASE}/profile-sync/class/${classId}/summary`,
  CLASS_TRENDS: (classId: string) => `${API_BASE}/profile-sync/class/${classId}/trends`,
  CLASS_COMPARE: `${API_BASE}/profile-sync/class/compare`,
} as const;

/**
 * Student Profile Endpoints
 */
export const STUDENT_PROFILE_ENDPOINTS = {
  SCORES: (studentId: string) => `${API_BASE}/student-profile/${studentId}/scores`,
  AI_ANALYSIS: (studentId: string) => `${API_BASE}/student-profile/${studentId}/ai-analysis`,
  ACADEMIC: (studentId: string) => `${API_BASE}/student-profile/${studentId}/academic`,
  SOCIAL_EMOTIONAL: (studentId: string) => `${API_BASE}/student-profile/${studentId}/social-emotional`,
  AGGREGATE: (studentId: string) => `${API_BASE}/student-profile/${studentId}/aggregate`,
} as const;

/**
 * Reports Endpoints
 */
export const REPORT_ENDPOINTS = {
  SCHOOL_STATS: `${API_BASE}/advanced-reports/school-stats`,
  CLASS_COMPARISONS: `${API_BASE}/advanced-reports/class-comparisons`,
  COMPARE_CLASSES: (class1: string, class2: string) => 
    `${API_BASE}/advanced-reports/compare/${encodeURIComponent(class1)}/${encodeURIComponent(class2)}`,
  TRENDS: `${API_BASE}/advanced-reports/trends`,
  COMPREHENSIVE: `${API_BASE}/advanced-reports/comprehensive`,
  EXPORT_EXCEL: `${API_BASE}/advanced-reports/export-excel`,
} as const;

/**
 * Helper function to build query params
 */
export function buildQueryParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Helper function to build full URL with query params
 */
export function buildUrl(
  endpoint: string, 
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryParams(params)}`;
}

/**
 * AI Suggestions Endpoints
 */
export const AI_SUGGESTIONS_ENDPOINTS = {
  PENDING: `${API_BASE}/ai-suggestions/pending`,
  BY_STUDENT: (studentId: string) => `${API_BASE}/ai-suggestions/student/${studentId}`,
  BY_ID: (id: string) => `${API_BASE}/ai-suggestions/${id}`,
  SEARCH: `${API_BASE}/ai-suggestions/search`,
  CREATE: `${API_BASE}/ai-suggestions/create`,
  BULK_CREATE: `${API_BASE}/ai-suggestions/bulk-create`,
  APPROVE: (id: string) => `${API_BASE}/ai-suggestions/${id}/approve`,
  REJECT: (id: string) => `${API_BASE}/ai-suggestions/${id}/reject`,
  MODIFY: (id: string) => `${API_BASE}/ai-suggestions/${id}/modify`,
  REVIEW: (id: string) => `${API_BASE}/ai-suggestions/${id}/review`,
  STATS: `${API_BASE}/ai-suggestions/stats/overview`,
  CLEANUP: `${API_BASE}/ai-suggestions/cleanup`,
} as const;

/**
 * Enhanced Risk Endpoints
 */
export const ENHANCED_RISK_ENDPOINTS = {
  SCORE: (studentId: string) => `${API_BASE}/enhanced-risk/score/${studentId}`,
  TREND: (studentId: string) => `${API_BASE}/enhanced-risk/trend/${studentId}`,
  BATCH_CALCULATE: `${API_BASE}/enhanced-risk/batch-calculate`,
} as const;

/**
 * Behavior Endpoints
 */
export const BEHAVIOR_ENDPOINTS = {
  BASE: `${API_BASE}/behavior`,
  BY_STUDENT: (studentId: string) => `${API_BASE}/behavior/${studentId}`,
  BY_ID: (id: string) => `${API_BASE}/behavior/${id}`,
} as const;

/**
 * Exam Endpoints
 */
export const EXAM_ENDPOINTS = {
  BASE: `${API_BASE}/exams`,
  BY_STUDENT: (studentId: string) => `${API_BASE}/exams/${studentId}`,
  BY_TYPE: (studentId: string, examType: string) => `${API_BASE}/exams/${studentId}/type/${examType}`,
  BY_ID: (id: string) => `${API_BASE}/exams/${id}`,
} as const;

/**
 * Attendance Endpoints
 */
export const ATTENDANCE_ENDPOINTS = {
  BASE: `${API_BASE}/attendance`,
  BY_STUDENT: (studentId: string) => `${API_BASE}/attendance/${studentId}`,
} as const;

/**
 * Coaching Endpoints
 */
export const COACHING_ENDPOINTS = {
  PARENT_MEETINGS: {
    BASE: `${API_BASE}/coaching/parent-meetings`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/coaching/parent-meetings/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/coaching/parent-meetings/${id}`,
  },
  HOME_VISITS: {
    BASE: `${API_BASE}/coaching/home-visits`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/coaching/home-visits/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/coaching/home-visits/${id}`,
  },
  FAMILY_PARTICIPATIONS: {
    BASE: `${API_BASE}/coaching/family-participations`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/coaching/family-participations/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/coaching/family-participations/${id}`,
  },
  ACADEMIC_GOALS: {
    BASE: `${API_BASE}/coaching/academic-goals`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/coaching/academic-goals/student/${studentId}`,
  },
  ACHIEVEMENTS: {
    BY_STUDENT: (studentId: string) => `${API_BASE}/coaching/achievements/student/${studentId}`,
  },
  MULTIPLE_INTELLIGENCE: (studentId: string) => `${API_BASE}/coaching/multiple-intelligence/student/${studentId}`,
  LEARNING_STYLES: (studentId: string) => `${API_BASE}/coaching/learning-styles/student/${studentId}`,
  SMART_GOALS: `${API_BASE}/coaching/smart-goals`,
} as const;

/**
 * Documents Endpoints
 */
export const DOCUMENTS_ENDPOINTS = {
  BASE: `${API_BASE}/documents`,
  BY_STUDENT: (studentId: string) => `${API_BASE}/documents/${studentId}`,
  BY_ID: (id: string) => `${API_BASE}/documents/${id}`,
} as const;

/**
 * Study Endpoints
 */
export const STUDY_ENDPOINTS = {
  SUBJECTS: `${API_BASE}/subjects`,
  TOPICS: `${API_BASE}/topics`,
  ASSIGNMENTS: (studentId: string) => `${API_BASE}/study-assignments/${studentId}`,
  ASSIGNMENTS_BASE: `${API_BASE}/study-assignments`,
  WEEKLY_SLOTS: `${API_BASE}/weekly-slots`,
  WEEKLY_SLOTS_BY_STUDENT: (studentId: string) => `${API_BASE}/weekly-slots/${studentId}`,
} as const;

/**
 * Holistic Profile Endpoints
 */
export const HOLISTIC_PROFILE_ENDPOINTS = {
  BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/student/${studentId}`,
  STRENGTHS: {
    BASE: `${API_BASE}/holistic-profile/strengths`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/strengths/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/strengths/${id}`,
  },
  SOCIAL_RELATIONS: {
    BASE: `${API_BASE}/holistic-profile/social-relations`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/social-relations/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/social-relations/${id}`,
  },
  INTERESTS: {
    BASE: `${API_BASE}/holistic-profile/interests`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/interests/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/interests/${id}`,
  },
  FUTURE_VISION: {
    BASE: `${API_BASE}/holistic-profile/future-vision`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/future-vision/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/future-vision/${id}`,
  },
  SEL_COMPETENCIES: {
    BASE: `${API_BASE}/holistic-profile/sel-competencies`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/sel-competencies/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/sel-competencies/${id}`,
  },
  SOCIOECONOMIC: {
    BASE: `${API_BASE}/holistic-profile/socioeconomic`,
    BY_STUDENT: (studentId: string) => `${API_BASE}/holistic-profile/socioeconomic/student/${studentId}`,
    BY_ID: (id: string) => `${API_BASE}/holistic-profile/socioeconomic/${id}`,
  },
} as const;

/**
 * Standardized Profile Endpoints
 */
export const STANDARDIZED_PROFILE_ENDPOINTS = {
  BEHAVIOR_INCIDENT: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/behavior-incident`,
  BEHAVIOR_INCIDENTS: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/behavior-incidents`,
  ACADEMIC: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/academic`,
  SOCIAL_EMOTIONAL: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/social-emotional`,
  TALENTS_INTERESTS: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/talents-interests`,
  HEALTH: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/health`,
  INTERVENTIONS: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/interventions`,
  INTERVENTION: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/intervention`,
  RISK_PROTECTIVE: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/risk-protective`,
  MOTIVATION: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/motivation`,
  AGGREGATE: (studentId: string) => `${API_BASE}/standardized-profile/${studentId}/aggregate`,
} as const;
