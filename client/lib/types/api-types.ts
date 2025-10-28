/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: Record<string, string>;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * User API Types
 */
export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'counselor' | 'teacher' | 'observer';
  institution: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'counselor' | 'teacher' | 'observer';
  institution: string;
  permissions: string[];
}

export interface UserLoginResponse extends ApiSuccessResponse<UserPublic> {
  user?: UserPublic;
}

/**
 * Error Types
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;
  details?: Record<string, string> | ValidationError[];
}

/**
 * Type Guards
 */
export function isApiSuccessResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  return typeof response === 'object' && response !== null && (response as ApiResponse<T>).success === true;
}

export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return typeof response === 'object' && response !== null && (response as ApiResponse).success === false;
}

/**
 * Survey API Types
 */
export interface SurveyResponse {
  id: string;
  templateId: string;
  distributionId: string;
  responseData: Record<string, unknown>;
  respondentId?: string;
  submittedAt: string;
}

/**
 * Backup API Types
 */
export interface BackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  createdBy: string;
  size: number;
  type: 'manual' | 'automatic';
  compressed: boolean;
  tables: string[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

/**
 * Student API Types
 */
export interface Student {
  id: string;
  studentNo: string;
  name: string;
  surname: string;
  className: string;
  gender: 'male' | 'female';
  birthDate: string;
  enrollmentYear: number;
  parentPhone?: string;
  parentEmail?: string;
  notes?: string;
}

/**
 * Analytics API Types
 */
export interface AnalyticsOverview {
  totalStudents: number;
  activeInterventions: number;
  upcomingSessions: number;
  recentAlerts: number;
}
