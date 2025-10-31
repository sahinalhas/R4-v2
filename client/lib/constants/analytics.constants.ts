export const ANALYTICS_THRESHOLDS = {
  ATTENDANCE: {
    EXCELLENT: 0.9,
    GOOD: 0.8,
    RISK: 0.7,
    CRITICAL: 0.5,
  },
  ACADEMIC_TREND: {
    POSITIVE: 0.3,
    NEGATIVE: -0.3,
    CRITICAL: -0.4,
    SEVERE: -0.7,
  },
  STUDY_CONSISTENCY: {
    EXCELLENT: 0.7,
    GOOD: 0.5,
    RISK: 0.3,
    CRITICAL: 0.1,
  },
  RISK_SCORE: {
    HIGH: 0.7,
    MEDIUM: 0.4,
  },
  PREDICTED_SUCCESS: {
    HIGH: 0.8,
  },
  SURVEY_SCORE: {
    LOW: 50,
  },
} as const;

export const ANALYTICS_WEIGHTS = {
  RISK_FACTORS: {
    ATTENDANCE: 1.5,
    ACADEMIC: 1.2,
    STUDY: 1.0,
  },
  SUCCESS_PREDICTION: {
    ACADEMIC_TREND: 0.3,
    ATTENDANCE: 0.25,
    STUDY_CONSISTENCY: 0.2,
    COMPLETION_RATE: 0.15,
    GOALS: 0.1,
  },
} as const;

export const ANALYTICS_DEFAULTS = {
  RECENT_SURVEY_COUNT: 3,
  STUDY_PERIOD_DAYS: 30,
  TOP_PERFORMERS_LIMIT: 5,
  AT_RISK_LIMIT: 5,
  ACTIVE_GOALS_TARGET: 3,
} as const;

export const RISK_LEVEL_MAP = {
  Düşük: 0.2,
  Orta: 0.5,
  Yüksek: 0.8,
} as const;

export const WARNING_PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
} as const;
