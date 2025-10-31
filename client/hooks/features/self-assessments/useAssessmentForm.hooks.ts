import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  SelfAssessmentQuestion,
  TemplateWithQuestions
} from '../../../../shared/types/self-assessment.types';
import { useSaveDraft, useSubmitAssessment } from './useSelfAssessments.hooks';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced as T & { cancel: () => void };
}

interface UseAssessmentFormProps {
  assessmentId: string;
  template: TemplateWithQuestions;
  initialResponses?: Record<string, any>;
  onSuccess?: () => void;
}

interface UseAssessmentFormReturn {
  responses: Record<string, any>;
  currentQuestionIndex: number;
  completionPercentage: number;
  isComplete: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  setResponse: (questionId: string, value: any) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (index: number) => void;
  saveDraft: () => void;
  submitAssessment: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentQuestion: SelfAssessmentQuestion | null;
}

export function useAssessmentForm({
  assessmentId,
  template,
  initialResponses = {},
  onSuccess
}: UseAssessmentFormProps): UseAssessmentFormReturn {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const saveDraftMutation = useSaveDraft();
  const submitMutation = useSubmitAssessment();

  const questions = template?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;

  const answeredQuestions = useMemo(() => {
    return questions.filter(q => {
      const answer = responses[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    });
  }, [responses, questions]);

  const completionPercentage = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((answeredQuestions.length / questions.length) * 100);
  }, [answeredQuestions.length, questions.length]);

  const isComplete = useMemo(() => {
    return questions.every(q => {
      if (!q.required) return true;
      const answer = responses[q.id];
      return answer !== undefined && answer !== null && answer !== '';
    });
  }, [responses, questions]);

  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;

  const setResponse = useCallback((questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const debouncedSaveDraft = useMemo(
    () => debounce(() => {
      saveDraftMutation.mutate({
        assessmentId,
        data: {
          responseData: responses,
          completionPercentage
        }
      });
    }, 2000),
    [assessmentId, responses, completionPercentage]
  );

  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      debouncedSaveDraft();
    }
    return () => {
      debouncedSaveDraft.cancel();
    };
  }, [responses, debouncedSaveDraft]);

  const saveDraft = useCallback(() => {
    debouncedSaveDraft.cancel();
    saveDraftMutation.mutate({
      assessmentId,
      data: {
        responseData: responses,
        completionPercentage
      }
    });
  }, [assessmentId, responses, completionPercentage, debouncedSaveDraft]);

  const submitAssessment = useCallback(() => {
    if (!isComplete) {
      return;
    }

    submitMutation.mutate(
      {
        assessmentId,
        data: {
          responseData: responses,
          parentConsentGiven: template.requiresParentConsent || undefined
        }
      },
      {
        onSuccess: () => {
          onSuccess?.();
        }
      }
    );
  }, [assessmentId, responses, isComplete, template.requiresParentConsent, onSuccess]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [canGoNext]);

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [questions.length]);

  return {
    responses,
    currentQuestionIndex,
    completionPercentage,
    isComplete,
    isSubmitting: submitMutation.isPending,
    isSaving: saveDraftMutation.isPending,
    setResponse,
    goToNext,
    goToPrevious,
    goToQuestion,
    saveDraft,
    submitAssessment,
    canGoNext,
    canGoPrevious,
    currentQuestion
  };
}
