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
  templateId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'LIKERT' | 'YES_NO' | 'RATING' | 'DROPDOWN';
  required: boolean;
  orderIndex: number;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
  };
  helpText?: string;
  placeholder?: string;
}

export interface SurveyResponse {
  id: string;
  distributionId: string;
  studentId?: string;
  studentInfo?: any;
  responseData: Record<string, any>;
  submittedAt: string;
  completionTime?: number;
  submissionType?: string;
  isComplete?: boolean;
  ipAddress?: string;
  userAgent?: string;
  created_at?: string;
}

export interface SurveyDistribution {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  status: string;
  targetStudents?: string[];
  targetClasses?: string[];
  maxResponses?: number;
  startDate?: string;
  endDate?: string;
  publicLink?: string;
  distributionType: string;
  allowAnonymous?: boolean;
  excelTemplate?: string;
  createdBy?: string;
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
  responsesByDay: any;
  demographicBreakdown: any;
  submissionTypes: any;
}
