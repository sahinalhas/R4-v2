import { useState } from "react";
import { SurveyQuestion } from "@/lib/survey-types";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

export function useTemplateQuestions() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuestions = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await surveyService.getTemplateQuestions(templateId);
      setQuestions(data);
      return data;
    } catch (error) {
      console.error("Error loading template questions:", error);
      toast({ 
        title: "Hata", 
        description: "Anket soruları yüklenemedi", 
        variant: "destructive" 
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  return {
    questions,
    loading,
    loadQuestions,
    clearQuestions
  };
}
