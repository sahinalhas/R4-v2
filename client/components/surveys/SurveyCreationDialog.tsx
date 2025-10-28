import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText } from "lucide-react";
import { MEB_SURVEY_TEMPLATES } from "@/lib/survey-types";
import { MebTemplateSelector } from "./templates/MebTemplateSelector";
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { QuestionsForm } from "./forms/QuestionsForm";
import { getMebDefaultQuestions } from "./templates/meb-templates";
import { surveyTemplateSchema, SurveyTemplateForm } from "./types";

interface SurveyCreationDialogProps {
  children: React.ReactNode;
  onSurveyCreated?: (survey: SurveyTemplateForm) => void;
}

export default function SurveyCreationDialog({ 
  children, 
  onSurveyCreated 
}: SurveyCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<"template" | "questions">("template");

  const form = useForm<SurveyTemplateForm>({
    resolver: zodResolver(surveyTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "OZEL",
      mebCompliant: false,
      estimatedDuration: 10,
      targetGrades: [],
      tags: [],
      questions: []
    },
  });

  const { fields: questions, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const loadMebTemplate = (templateKey: keyof typeof MEB_SURVEY_TEMPLATES) => {
    const template = MEB_SURVEY_TEMPLATES[templateKey];
    form.setValue("title", template.title);
    form.setValue("description", template.description);
    form.setValue("type", template.type);
    form.setValue("mebCompliant", template.mebCompliant);
    form.setValue("estimatedDuration", template.estimatedDuration);
    form.setValue("targetGrades", template.targetGrades);
    
    const defaultQuestions = getMebDefaultQuestions(templateKey);
    form.setValue("questions", defaultQuestions);
    setCurrentStep("questions");
  };

  const onSubmit = async (data: SurveyTemplateForm) => {
    try {
      const templateId = `template_${Date.now()}`;
      const templateData = {
        id: templateId,
        title: data.title,
        description: data.description || "",
        type: data.type,
        mebCompliant: data.mebCompliant,
        isActive: true,
        createdBy: "user",
        tags: data.tags || [],
        estimatedDuration: data.estimatedDuration || 10,
        targetGrades: data.targetGrades || []
      };

      const templateResponse = await fetch('/api/survey-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!templateResponse.ok) {
        throw new Error('Failed to create survey template');
      }

      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const questionData = {
          id: `question_${templateId}_${i}`,
          templateId: templateId,
          questionText: question.questionText,
          questionType: question.questionType,
          required: question.required,
          orderIndex: i,
          options: question.options,
          validation: question.validation
        };

        const questionResponse = await fetch('/api/survey-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });

        if (!questionResponse.ok) {
          console.error(`Failed to create question ${i + 1}`);
        }
      }

      onSurveyCreated?.(data);
      setOpen(false);
      form.reset();
      setCurrentStep("template");
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Anket oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Anket Oluştur</DialogTitle>
          <DialogDescription>
            MEB standartlarına uygun anket şablonu oluşturun veya özel anket tasarlayın
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as "template" | "questions")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">
                  <Settings className="mr-2 h-4 w-4" />
                  Temel Bilgiler
                </TabsTrigger>
                <TabsTrigger value="questions">
                  <FileText className="mr-2 h-4 w-4" />
                  Sorular
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4">
                <MebTemplateSelector onTemplateSelect={loadMebTemplate} />
                <BasicInfoForm control={form.control} />
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep("questions")}
                  >
                    Sonraki: Sorular
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                <QuestionsForm
                  control={form.control}
                  questions={questions}
                  append={append}
                  remove={remove}
                  setValue={form.setValue}
                  watch={form.watch}
                />

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep("template")}
                  >
                    Önceki
                  </Button>
                  <Button type="submit">
                    Anket Oluştur
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
