import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { selfAssessmentsApi } from '@/lib/api/endpoints/self-assessments.api';
import type {
  SelfAssessmentTemplate,
  TemplateWithQuestions,
  StudentSelfAssessment,
  AssessmentWithTemplate,
  StartAssessmentRequest,
  SaveAssessmentDraftRequest,
  SubmitAssessmentRequest,
  SelfAssessmentCategory,
  AssessmentStatus
} from '../../../../shared/types/self-assessment.types';

const QUERY_KEYS = {
  templates: ['self-assessments', 'templates'] as const,
  template: (id: string) => ['self-assessments', 'template', id] as const,
  templateWithQuestions: (id: string) => ['self-assessments', 'template-questions', id] as const,
  activeTemplates: (studentId: string, grade?: string) => 
    ['self-assessments', 'active-templates', studentId, grade] as const,
  assessments: ['self-assessments', 'my-assessments'] as const,
  assessment: (id: string) => ['self-assessments', 'assessment', id] as const,
} as const;

export function useSelfAssessmentTemplates(params?: {
  isActive?: boolean;
  category?: SelfAssessmentCategory;
  grade?: string;
}) {
  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.templates, params],
    queryFn: () => selfAssessmentsApi.templates.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    templates,
    isLoading,
    error,
    refetch
  };
}

export function useSelfAssessmentTemplate(templateId: string, withQuestions: boolean = false) {
  const queryKey = withQuestions 
    ? QUERY_KEYS.templateWithQuestions(templateId)
    : QUERY_KEYS.template(templateId);

  const queryFn = withQuestions
    ? () => selfAssessmentsApi.templates.getWithQuestions(templateId)
    : () => selfAssessmentsApi.templates.getById(templateId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    template: data as TemplateWithQuestions | SelfAssessmentTemplate | undefined,
    isLoading,
    error,
    refetch
  };
}

export function useActiveTemplatesForStudent(studentId: string, grade?: string) {
  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.activeTemplates(studentId, grade),
    queryFn: () => selfAssessmentsApi.templates.getActiveForStudent(studentId, grade),
    enabled: !!studentId,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    templates,
    isLoading,
    error,
    refetch
  };
}

export function useMyAssessments(params?: {
  studentId?: string;
  status?: AssessmentStatus;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.assessments, params],
    queryFn: () => selfAssessmentsApi.assessments.getMyAssessments(params),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    assessments: data?.assessments || [],
    isLoading,
    error,
    refetch
  };
}

export function useAssessmentById(assessmentId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.assessment(assessmentId),
    queryFn: () => selfAssessmentsApi.assessments.getById(assessmentId),
    enabled: !!assessmentId,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    assessment: data as AssessmentWithTemplate | undefined,
    isLoading,
    error,
    refetch
  };
}

export function useStartAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartAssessmentRequest) => 
      selfAssessmentsApi.assessments.start(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assessments });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.activeTemplates(variables.studentId) 
      });
      toast.success('Anket başlatıldı', {
        description: 'Şimdi soruları cevaplamaya başlayabilirsiniz.'
      });
    },
    onError: (error) => {
      console.error('Error starting assessment:', error);
      toast.error('Anket başlatılamadı', {
        description: 'Lütfen tekrar deneyin veya sistem yöneticisine başvurun.'
      });
    }
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, data }: { 
      assessmentId: string; 
      data: SaveAssessmentDraftRequest 
    }) => selfAssessmentsApi.assessments.saveDraft(assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.assessment(variables.assessmentId) 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assessments });
    },
    onError: (error) => {
      console.error('Error saving draft:', error);
      toast.error('Taslak kaydedilemedi', {
        description: 'Lütfen tekrar deneyin.'
      });
    }
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, data }: { 
      assessmentId: string; 
      data: SubmitAssessmentRequest 
    }) => selfAssessmentsApi.assessments.submit(assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.assessment(variables.assessmentId) 
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assessments });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.templates 
      });
    },
    onError: (error) => {
      console.error('Error submitting assessment:', error);
      toast.error('Anket gönderilemedi', {
        description: 'Lütfen tekrar deneyin.'
      });
    }
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessmentId: string) => 
      selfAssessmentsApi.assessments.delete(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assessments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
    },
    onError: (error) => {
      console.error('Error deleting assessment:', error);
      toast.error('Anket silinemedi', {
        description: 'Lütfen tekrar deneyin.'
      });
    }
  });
}
