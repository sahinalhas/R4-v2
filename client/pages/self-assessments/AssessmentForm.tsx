import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Button } from '@/components/atoms/Button';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
  QuestionRenderer,
  ProgressTracker
} from '@/components/features/self-assessments';
import {
  useAssessmentById
} from '@/hooks/features/self-assessments';
import { useAssessmentForm } from '@/hooks/features/self-assessments/useAssessmentForm.hooks';
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AssessmentForm() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const { assessment, isLoading, error } = useAssessmentById(assessmentId || '');

  const {
    responses,
    currentQuestionIndex,
    completionPercentage,
    isComplete,
    isSubmitting,
    isSaving,
    setResponse,
    goToNext,
    goToPrevious,
    goToQuestion,
    saveDraft,
    submitAssessment,
    canGoNext,
    canGoPrevious,
    currentQuestion
  } = useAssessmentForm({
    assessmentId: assessmentId || '',
    template: assessment?.template as any,
    initialResponses: assessment?.responseData || {},
    onSuccess: () => {
      navigate(`/self-assessments/${assessmentId}/complete`);
    }
  });

  useEffect(() => {
    if (!assessmentId) {
      navigate('/self-assessments');
    }
  }, [assessmentId, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anket yüklenemedi. Lütfen daha sonra tekrar deneyin.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/self-assessments')} className="mt-4">
          Anketlere Dön
        </Button>
      </div>
    );
  }

  if (assessment.status !== 'DRAFT') {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Bu anket zaten gönderilmiş. Değişiklik yapamazsınız.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/self-assessments')} className="mt-4">
          Anketlere Dön
        </Button>
      </div>
    );
  }

  const questions = (assessment as any)?.questions || [];

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bu ankette soru bulunmuyor.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/self-assessments')} className="mt-4">
          Anketlere Dön
        </Button>
      </div>
    );
  }

  const answeredQuestions = questions.filter((q: any) => {
    const answer = responses[q.id];
    return answer !== undefined && answer !== null && answer !== '';
  });

  const handleSubmit = () => {
    if (!isComplete) {
      const unansweredRequired = questions.filter(
        (q: any) => q.required && !responses[q.id]
      );
      
      if (unansweredRequired.length > 0) {
        toast.error('Lütfen tüm zorunlu soruları cevaplayın', {
          description: `${unansweredRequired.length} zorunlu soru cevaplanmadı.`
        });
        return;
      }
    }

    const confirmMessage = assessment.template?.requiresParentConsent
      ? 'Anketi göndermek istediğinizden emin misiniz? Veli onayı gereklidir.'
      : 'Anketi göndermek istediğinizden emin misiniz?';

    if (confirm(confirmMessage)) {
      submitAssessment();
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assessment.template?.title}</h1>
          {assessment.template?.description && (
            <p className="text-gray-600 mt-1">{assessment.template.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm('Anketten çıkmak istediğiniz emin misiniz? İlerlemeniz kaydedilecek.')) {
              saveDraft();
              navigate('/self-assessments');
            }
          }}
        >
          Çık
        </Button>
      </div>

      <ProgressTracker
        totalQuestions={questions.length}
        currentQuestionIndex={currentQuestionIndex}
        answeredCount={answeredQuestions.length}
        completionPercentage={completionPercentage}
      />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </CardTitle>
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Save className="w-4 h-4 animate-pulse" />
                Kaydediliyor...
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion && (
            <QuestionRenderer
              question={currentQuestion}
              value={responses[currentQuestion.id]}
              onChange={(value) => setResponse(currentQuestion.id, value)}
            />
          )}

          <div className="flex items-center justify-between gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Önceki
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={saveDraft}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Send className="w-4 h-4 mr-2 animate-pulse" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Anketi Gönder
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={!canGoNext}
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {assessment.template?.requiresParentConsent && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Dikkat:</strong> Bu anket veli onayı gerektirmektedir. Anketi göndermeden önce
            velilerinizin onayını aldığınızdan emin olun.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {questions.map((_: any, idx: number) => {
          const isAnswered = responses[questions[idx].id] !== undefined && 
                             responses[questions[idx].id] !== null && 
                             responses[questions[idx].id] !== '';
          const isCurrent = idx === currentQuestionIndex;

          return (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`p-2 rounded text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white'
                  : isAnswered
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
