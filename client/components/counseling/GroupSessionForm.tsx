import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

import type { GroupSessionFormValues, Student, CounselingTopic } from "./types";
import FormStepper, { Step } from "./form-steps/FormStepper";
import FormProgress from "./form-widgets/FormProgress";
import ParticipantStep from "./form-steps/ParticipantStep";
import SessionDetailsStep from "./form-steps/SessionDetailsStep";

interface GroupSessionFormProps {
  form: UseFormReturn<GroupSessionFormValues>;
  students: Student[];
  topics: CounselingTopic[];
  selectedStudents: Student[];
  onSelectedStudentsChange: (students: Student[]) => void;
  onSubmit: (data: GroupSessionFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

const STEPS: Step[] = [
  { id: 1, title: "Katılımcılar", description: "Grup & Konu" },
  { id: 2, title: "Detaylar", description: "Tarih & Yer" },
];

export default function GroupSessionForm({
  form,
  students,
  topics,
  selectedStudents,
  onSelectedStudentsChange,
  onSubmit,
  onCancel,
  isPending,
}: GroupSessionFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof GroupSessionFormValues)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['studentIds', 'topic', 'participantType'];
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
              sessionType="group"
              selectedStudents={selectedStudents}
              onSelectedStudentsChange={onSelectedStudentsChange}
            />
          )}

          {currentStep === 2 && (
            <SessionDetailsStep form={form} />
          )}
        </div>

        {/* Navigation */}
        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex w-full justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={currentStep === 1 ? onCancel : handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
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
              >
                İleri
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isPending}
                className="min-w-[160px]"
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Grup Görüşmesini Başlat
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
