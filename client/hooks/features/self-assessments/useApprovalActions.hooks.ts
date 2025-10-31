import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { selfAssessmentsApi } from '@/lib/api/endpoints/self-assessments.api';
import type {
  ApproveUpdateRequest,
  RejectUpdateRequest,
  BulkApprovalRequest
} from '../../../../shared/types/self-assessment.types';

/**
 * Hook to approve one or more profile updates
 */
export function useApproveUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveUpdateRequest) => 
      selfAssessmentsApi.profileUpdates.approve(data),
    onSuccess: (result) => {
      // Invalidate all profile update queries
      queryClient.invalidateQueries({ 
        queryKey: ['self-assessments', 'profile-updates'] 
      });
      
      // Also invalidate student profile data as it may have changed
      queryClient.invalidateQueries({ 
        queryKey: ['students'] 
      });
      
      toast.success('Başarılı', {
        description: result.message || `${result.appliedCount} güncelleme onaylandı`
      });
    },
    onError: (error: Error) => {
      console.error('Error approving updates:', error);
      toast.error('Onaylama başarısız', {
        description: error.message || 'Güncellemeler onaylanamadı. Lütfen tekrar deneyin.'
      });
    }
  });
}

/**
 * Hook to reject a profile update
 */
export function useRejectUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RejectUpdateRequest) => 
      selfAssessmentsApi.profileUpdates.reject(data),
    onSuccess: () => {
      // Invalidate all profile update queries
      queryClient.invalidateQueries({ 
        queryKey: ['self-assessments', 'profile-updates'] 
      });
      
      toast.success('Güncelleme reddedildi', {
        description: 'Profil güncellemesi başarıyla reddedildi.'
      });
    },
    onError: (error: Error) => {
      console.error('Error rejecting update:', error);
      toast.error('Reddetme başarısız', {
        description: error.message || 'Güncelleme reddedilemedi. Lütfen tekrar deneyin.'
      });
    }
  });
}

/**
 * Hook to bulk approve multiple updates for a student
 */
export function useBulkApproveUpdates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkApprovalRequest) => 
      selfAssessmentsApi.profileUpdates.bulkApprove(data),
    onSuccess: (result) => {
      // Invalidate all profile update queries
      queryClient.invalidateQueries({ 
        queryKey: ['self-assessments', 'profile-updates'] 
      });
      
      // Also invalidate student profile data
      queryClient.invalidateQueries({ 
        queryKey: ['students'] 
      });
      
      toast.success('Toplu onay başarılı', {
        description: result.message || `${result.approvedCount} güncelleme toplu olarak onaylandı`
      });
    },
    onError: (error: Error) => {
      console.error('Error bulk approving updates:', error);
      toast.error('Toplu onay başarısız', {
        description: error.message || 'Güncellemeler onaylanamadı. Lütfen tekrar deneyin.'
      });
    }
  });
}
