import { apiClient } from '../core/client';
import type {
  SelfAssessmentTemplate,
  SelfAssessmentQuestion,
  StudentSelfAssessment,
  TemplateWithQuestions,
  AssessmentWithTemplate,
  ProfileUpdateQueue,
  UpdateSuggestion,
  StartAssessmentRequest,
  SaveAssessmentDraftRequest,
  SubmitAssessmentRequest,
  ApproveUpdateRequest,
  RejectUpdateRequest,
  BulkApprovalRequest,
  BulkApprovalResult,
  PendingUpdatesFilter,
  PendingUpdatesResponse,
  SelfAssessmentCategory,
  AssessmentStatus
} from '../../../../shared/types/self-assessment.types';

const BASE_URL = '/api/self-assessments';

export const selfAssessmentsApi = {
  templates: {
    getAll: async (params?: {
      isActive?: boolean;
      category?: SelfAssessmentCategory;
      grade?: string;
    }): Promise<SelfAssessmentTemplate[]> => {
      const query = new URLSearchParams();
      if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
      if (params?.category) query.set('category', params.category);
      if (params?.grade) query.set('grade', params.grade);
      
      const queryString = query.toString();
      const url = queryString ? `${BASE_URL}/templates?${queryString}` : `${BASE_URL}/templates`;
      
      return apiClient.get<SelfAssessmentTemplate[]>(url, {
        showErrorToast: true
      });
    },

    getById: async (id: string): Promise<SelfAssessmentTemplate> => {
      return apiClient.get<SelfAssessmentTemplate>(`${BASE_URL}/templates/${id}`, {
        showErrorToast: true
      });
    },

    getWithQuestions: async (id: string): Promise<TemplateWithQuestions> => {
      return apiClient.get<TemplateWithQuestions>(
        `${BASE_URL}/templates/${id}/with-questions`,
        { showErrorToast: true }
      );
    },

    getActiveForStudent: async (
      studentId: string,
      grade?: string
    ): Promise<Array<SelfAssessmentTemplate & {
      completionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      lastAttemptDate?: string;
    }>> => {
      let url = `${BASE_URL}/templates/student/${studentId}/active`;
      if (grade) {
        url += `?grade=${encodeURIComponent(grade)}`;
      }
      
      return apiClient.get(url, {
        showErrorToast: true
      });
    },

    create: async (
      templateData: Partial<SelfAssessmentTemplate>
    ): Promise<{ success: boolean; template: SelfAssessmentTemplate; message: string }> => {
      return apiClient.post(`${BASE_URL}/templates`, templateData, {
        showSuccessToast: true,
        showErrorToast: true
      });
    },

    update: async (
      id: string,
      templateData: Partial<SelfAssessmentTemplate>
    ): Promise<{ success: boolean; template: SelfAssessmentTemplate; message: string }> => {
      return apiClient.put(`${BASE_URL}/templates/${id}`, templateData, {
        showSuccessToast: true,
        showErrorToast: true
      });
    },

    delete: async (
      id: string
    ): Promise<{ success: boolean; message: string }> => {
      return apiClient.delete(`${BASE_URL}/templates/${id}`, {
        showSuccessToast: true,
        successMessage: 'Anket şablonu başarıyla silindi',
        showErrorToast: true
      });
    }
  },

  assessments: {
    start: async (
      data: StartAssessmentRequest
    ): Promise<{ success: boolean; assessmentId: string; status: AssessmentStatus }> => {
      return apiClient.post(`${BASE_URL}/start`, data, {
        showErrorToast: true
      });
    },

    saveDraft: async (
      assessmentId: string,
      data: SaveAssessmentDraftRequest
    ): Promise<{ success: boolean; savedAt: string; completionPercentage: number }> => {
      return apiClient.put(`${BASE_URL}/${assessmentId}/save`, data, {
        showSuccessToast: true,
        successMessage: 'Taslak kaydedildi',
        showErrorToast: true
      });
    },

    submit: async (
      assessmentId: string,
      data: SubmitAssessmentRequest
    ): Promise<{
      success: boolean;
      assessmentId: string;
      status: AssessmentStatus;
      message: string;
    }> => {
      return apiClient.post(`${BASE_URL}/${assessmentId}/submit`, data, {
        showSuccessToast: true,
        successMessage: 'Anket başarıyla gönderildi',
        showErrorToast: true
      });
    },

    getMyAssessments: async (params?: {
      studentId?: string;
      status?: AssessmentStatus;
    }): Promise<{
      assessments: Array<{
        id: string;
        templateTitle: string;
        templateCategory?: SelfAssessmentCategory;
        status: AssessmentStatus;
        completionPercentage: number;
        submittedAt?: string;
        reviewedAt?: string;
        created_at?: string;
      }>;
    }> => {
      const query = new URLSearchParams();
      if (params?.studentId) query.set('studentId', params.studentId);
      if (params?.status) query.set('status', params.status);
      
      const queryString = query.toString();
      const url = queryString ? `${BASE_URL}/my-assessments?${queryString}` : `${BASE_URL}/my-assessments`;
      
      return apiClient.get(url, {
        showErrorToast: true
      });
    },

    getById: async (assessmentId: string): Promise<AssessmentWithTemplate> => {
      return apiClient.get<AssessmentWithTemplate>(`${BASE_URL}/${assessmentId}`, {
        showErrorToast: true
      });
    },

    delete: async (
      assessmentId: string
    ): Promise<{ success: boolean; message: string }> => {
      return apiClient.delete(`${BASE_URL}/${assessmentId}`, {
        showSuccessToast: true,
        successMessage: 'Anket başarıyla silindi',
        showErrorToast: true
      });
    }
  },

  profileUpdates: {
    getPending: async (
      filter?: PendingUpdatesFilter
    ): Promise<PendingUpdatesResponse> => {
      const query = new URLSearchParams();
      if (filter?.studentId) query.set('studentId', filter.studentId);
      if (filter?.category) query.set('category', filter.category);
      if (filter?.sortBy) query.set('sortBy', filter.sortBy);
      
      const queryString = query.toString();
      const url = queryString ? `${BASE_URL}/profile-updates/pending?${queryString}` : `${BASE_URL}/profile-updates/pending`;
      
      return apiClient.get(url, {
        showErrorToast: true
      });
    },

    getByStudent: async (
      studentId: string
    ): Promise<{ suggestions: UpdateSuggestion[] }> => {
      return apiClient.get(`${BASE_URL}/profile-updates/student/${studentId}`, {
        showErrorToast: true
      });
    },

    getById: async (updateId: string): Promise<ProfileUpdateQueue> => {
      return apiClient.get(`${BASE_URL}/profile-updates/${updateId}`, {
        showErrorToast: true
      });
    },

    approve: async (
      data: ApproveUpdateRequest
    ): Promise<{
      success: boolean;
      appliedCount: number;
      updatedFields: string[];
      message: string;
    }> => {
      return apiClient.post(`${BASE_URL}/profile-updates/approve`, data, {
        showSuccessToast: true,
        showErrorToast: true
      });
    },

    reject: async (
      data: RejectUpdateRequest
    ): Promise<{ success: boolean; message: string }> => {
      return apiClient.post(`${BASE_URL}/profile-updates/reject`, data, {
        showSuccessToast: true,
        successMessage: 'Güncelleme reddedildi',
        showErrorToast: true
      });
    },

    bulkApprove: async (
      data: BulkApprovalRequest
    ): Promise<{
      success: boolean;
      approvedCount: number;
      updatedFields: string[];
      message: string;
    }> => {
      return apiClient.post(`${BASE_URL}/profile-updates/bulk-approve`, data, {
        showSuccessToast: true,
        showErrorToast: true
      });
    }
  }
};

export default selfAssessmentsApi;
