// Re-export shared types for consistency
export type { 
  UnifiedStudent as Student, 
  BackendStudent,
  ProfileCompleteness,
  UnifiedStudentScores
} from '@shared/types/student.types';

export { 
  backendToUnified as backendToFrontend,
  unifiedToBackend as frontendToBackend,
  STUDENT_VALIDATION_RULES,
  PROFILE_QUALITY_THRESHOLDS
} from '@shared/types/student.types';
