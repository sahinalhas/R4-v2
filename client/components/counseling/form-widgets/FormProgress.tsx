import { Check, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;
  const isComplete = currentStep === totalSteps;
  
  return (
    <div className="w-full space-y-3 p-5 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-100/60 dark:bg-violet-900/30">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="font-semibold text-base text-slate-700 dark:text-slate-200">Form İlerlemesi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold text-2xl transition-all duration-300",
            isComplete 
              ? "text-emerald-600 dark:text-emerald-400" 
              : "text-violet-600 dark:text-violet-400"
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="flex items-center justify-between text-sm pt-0.5">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          Adım {currentStep} / {totalSteps}
        </span>
        <span className={cn(
          "font-medium transition-all duration-300 flex items-center gap-1.5",
          isComplete 
            ? "text-emerald-600 dark:text-emerald-400" 
            : "text-slate-600 dark:text-slate-400"
        )}>
          {isComplete ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Tamamlanabilir
            </>
          ) : (
            `${totalSteps - currentStep} adım kaldı`
          )}
        </span>
      </div>
    </div>
  );
}
