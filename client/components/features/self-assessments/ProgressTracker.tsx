import { Progress } from '@/components/atoms/Progress';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredCount: number;
  completionPercentage: number;
}

export function ProgressTracker({
  totalQuestions,
  currentQuestionIndex,
  answeredCount,
  completionPercentage
}: ProgressTrackerProps) {
  return (
    <div className="w-full space-y-4 p-6 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Soru {currentQuestionIndex + 1} / {totalQuestions}
        </span>
        <span className="text-gray-600">
          {answeredCount} / {totalQuestions} cevaplandı
        </span>
      </div>
      
      <Progress value={completionPercentage} className="h-2" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(totalQuestions, 10) }).map((_, idx) => {
              const isAnswered = idx < answeredCount;
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <div
                  key={idx}
                  className={`rounded-full transition-all ${
                    isAnswered
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-300'
                  }`}
                >
                  {isAnswered ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
              );
            })}
            {totalQuestions > 10 && (
              <span className="text-xs text-gray-500 ml-2">
                +{totalQuestions - 10} daha
              </span>
            )}
          </div>
        </div>
        
        <span className="text-sm font-semibold text-primary">
          %{completionPercentage} tamamlandı
        </span>
      </div>
    </div>
  );
}
