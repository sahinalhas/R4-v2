export interface AcademicGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  targetScore?: number;
  currentScore?: number;
  examType?: string;
  deadline: string;
  status: string;
  created_at?: string;
}

export interface MultipleIntelligence {
  id: string;
  studentId: string;
  assessmentDate: string;
  linguisticVerbal?: number;
  logicalMathematical?: number;
  visualSpatial?: number;
  bodilyKinesthetic?: number;
  musicalRhythmic?: number;
  interpersonal?: number;
  intrapersonal?: number;
  naturalistic?: number;
  notes?: string;
}

export interface LearningStyle {
  id: string;
  studentId: string;
  assessmentDate: string;
  visual?: number;
  auditory?: number;
  kinesthetic?: number;
  reading?: number;
  notes?: string;
}

export interface SmartGoal {
  id: string;
  studentId: string;
  title: string;
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  category?: string;
  status: string;
  progress?: number;
  startDate?: string;
  targetDate?: string;
  notes?: string;
  created_at?: string;
}

export interface CoachingRecommendation {
  id: string;
  studentId: string;
  type: string;
  title: string;
  description?: string;
  priority?: string;
  status: string;
  automated?: boolean;
  implementationSteps?: any[];
  createdAt?: string;
}

export interface Evaluation360 {
  id: string;
  studentId: string;
  evaluationDate: string;
  selfEvaluation?: any;
  teacherEvaluation?: any;
  peerEvaluation?: any;
  parentEvaluation?: any;
  strengths?: any[];
  areasForImprovement?: any[];
  actionPlan?: any[];
  notes?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  category?: string;
  earnedAt: string;
  points?: number;
}

export interface SelfAssessment {
  id: string;
  studentId: string;
  moodRating?: number;
  motivationLevel?: number;
  stressLevel?: number;
  confidenceLevel?: number;
  studyDifficulty?: number;
  socialInteraction?: number;
  sleepQuality?: number;
  physicalActivity?: number;
  dailyGoalsAchieved?: boolean;
  todayHighlight?: string;
  todayChallenge?: string;
  tomorrowGoal?: string;
  notes?: string;
  assessmentDate: string;
}

export interface ParentMeeting {
  id: string;
  studentId: string;
  meetingDate: string;
  time?: string;
  type?: string;
  participants?: any[];
  mainTopics?: any[];
  concerns?: string;
  decisions?: string;
  actionPlan?: string;
  nextMeetingDate?: string;
  parentSatisfaction?: number;
  followUpRequired?: boolean;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface HomeVisit {
  id: string;
  studentId: string;
  date: string;
  time?: string;
  visitDuration?: number;
  visitors?: any[];
  familyPresent?: any[];
  homeEnvironment?: string;
  familyInteraction?: string;
  observations?: string;
  recommendations?: string;
  concerns?: string;
  resources?: string;
  followUpActions?: string;
  nextVisitPlanned?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface FamilyParticipation {
  id: string;
  studentId: string;
  eventType?: string;
  eventName?: string;
  eventDate: string;
  participationStatus?: string;
  participants?: any[];
  engagementLevel?: number;
  communicationFrequency?: string;
  preferredContactMethod?: string;
  parentAvailability?: string;
  notes?: string;
  recordedBy?: string;
  recordedAt?: string;
}
