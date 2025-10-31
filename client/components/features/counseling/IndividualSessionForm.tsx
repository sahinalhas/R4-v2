import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

import { Form } from "@/components/organisms/Form";
import { Button } from "@/components/atoms/Button";
import { DialogFooter } from "@/components/organisms/Dialog";

import type { IndividualSessionFormValues, Student, CounselingTopic } from "./types";
import FormStepper, { Step } from "./form-steps/FormStepper";
import FormProgress from "./form-widgets/FormProgress";
import ParticipantStep from "./form-steps/ParticipantStep";
import SessionDetailsStep from "./form-steps/SessionDetailsStep";

interface IndividualSessionFormProps {
  form: UseFormReturn<IndividualSessionFormValues>;
  students: Student[];
  topics: CounselingTopic[];
  onSubmit: (data: IndividualSessionFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

const STEPS: Step[] = [
  { id: 1, title: "Katılımcılar", description: "Öğrenci & Konu" },
  { id: 2, title: "Detaylar", description: "Tarih & Yer" },
];

export default function IndividualSessionForm({
  form,
  students,
  topics,
  onSubmit,
  onCancel,
  isPending,
}: IndividualSessionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof IndividualSessionFormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['studentId', 'topic', 'participantType'];
        break;
      case 2:
        fieldsToValidate = ['sessionDate', 'sessionTime', 'sessionMode', 'sessionLocation'];
        break;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep === STEPS.length) {
      form.handleSubmit(onSubmit)();
    } else {
      await handleNext();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-7">
        <FormProgress currentStep={currentStep} totalSteps={STEPS.length} />

        <FormStepper 
          steps={STEPS} 
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="min-h-[450px] px-1">
          {currentStep === 1 && (
            <ParticipantStep
              form={form}
              students={students}
              topics={topics}
              sessionType="individual"
            />
          )}

          {currentStep === 2 && (
            <SessionDetailsStep form={form} />
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex w-full justify-between gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={currentStep === 1 ? onCancel : handlePrevious}
              className="h-11 px-5 rounded-xl border font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              {currentStep === 1 ? 'İptal' : 'Geri'}
            </Button>

            {currentStep < STEPS.length ? (
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext();
                }}
                className="h-11 px-6 rounded-xl font-medium bg-violet-500/90 hover:bg-violet-600/90 text-white shadow-sm transition-all min-w-[120px]"
              >
                İleri
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isPending}
                className="h-11 px-6 rounded-xl font-medium bg-emerald-500/90 hover:bg-emerald-600/90 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Başlatılıyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Görüşmeyi Başlat
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
