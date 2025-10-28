// Survey-related TypeScript interfaces for improved type safety

export interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  type: string;
  mebCompliant: boolean;
  isActive: boolean;
  createdBy?: string;
  tags: string[];
  estimatedDuration?: number;
  targetGrades: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'LIKERT' | 'YES_NO' | 'RATING' | 'DROPDOWN';
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
}

export interface SurveyResponse {
  id: string;
  distributionId: string;
  studentId?: string;
  responseData: Record<string, any>;
  submittedAt: string;
  completionTime?: number;
  submissionType?: string;
}

export interface SurveyDistribution {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  targetStudents?: string[];
  maxResponses?: number;
  startDate?: string;
  endDate?: string;
  publicLink?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  responseRate: string;
  optionCounts?: OptionCount[];
  averageRating?: number | string;
  distribution?: RatingDistribution;
  yesCount?: number;
  noCount?: number;
  responses?: any[];
  averageLength?: number;
  sentiment?: SentimentAnalysis;
}

export interface OptionCount {
  option: string;
  count: number;
  percentage: string;
}

export interface RatingDistribution {
  [rating: string]: number;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall?: 'positive' | 'negative' | 'neutral';
}

export interface SurveyAnalytics {
  distributionInfo: {
    id: string;
    title: string;
    templateTitle: string;
    status: string;
    totalTargets: number;
    totalResponses: number;
    responseRate: string;
  };
  overallStats: {
    averageCompletionTime: number | string;
    mostSkippedQuestion: string | null;
    satisfactionScore: string | number;
  };
  questionAnalytics: QuestionAnalytics[];
}

export interface DistributionStatistics {
  totalResponses: number;
  completionRate: string;
  responsesByDay: DailyResponseCount[];
  demographicBreakdown: DemographicBreakdown;
  submissionTypes: SubmissionTypeBreakdown;
}

export interface DailyResponseCount {
  date: string;
  count: number;
}

export interface DemographicBreakdown {
  byGrade: Record<string, number>;
  byGender: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface SubmissionTypeBreakdown {
  excel: number;
  online: number;
  paper: number;
}

// Database table info type for PRAGMA queries
export interface TableColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}