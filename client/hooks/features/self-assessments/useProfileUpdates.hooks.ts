import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { selfAssessmentsApi } from '@/lib/api/endpoints/self-assessments.api';
import type {
  ProfileUpdateQueue,
  UpdateSuggestion,
  PendingUpdatesFilter,
  PendingUpdatesResponse
} from '../../../../shared/types/self-assessment.types';

const QUERY_KEYS = {
  pendingUpdates: (filter?: PendingUpdatesFilter) => 
    ['self-assessments', 'profile-updates', 'pending', filter] as const,
  studentUpdates: (studentId: string) => 
    ['self-assessments', 'profile-updates', 'student', studentId] as const,
  updateById: (updateId: string) => 
    ['self-assessments', 'profile-updates', updateId] as const,
} as const;

/**
 * Hook to fetch pending profile updates
 * @param filter - Filter options for pending updates
 */
export function usePendingUpdates(filter?: PendingUpdatesFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.pendingUpdates(filter),
    queryFn: () => selfAssessmentsApi.profileUpdates.getPending(filter),
    staleTime: 30 * 1000, // 30 seconds - fresh data for counselors
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    pending: data?.pending || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook to fetch profile update suggestions for a specific student
 * @param studentId - The student ID
 */
export function useStudentProfileUpdates(studentId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.studentUpdates(studentId),
    queryFn: () => selfAssessmentsApi.profileUpdates.getByStudent(studentId),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    suggestions: data?.suggestions || [],
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook to fetch a specific profile update by ID
 * @param updateId - The update ID
 */
export function useProfileUpdateById(updateId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.updateById(updateId),
    queryFn: () => selfAssessmentsApi.profileUpdates.getById(updateId),
    enabled: !!updateId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    update: data,
    isLoading,
    error,
    refetch
  };
}
