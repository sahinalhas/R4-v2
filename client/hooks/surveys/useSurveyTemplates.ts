import { useState, useEffect } from "react";
import { SurveyTemplate } from "@/lib/survey-types";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

export function useSurveyTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await surveyService.getTemplates(signal);
      setTemplates(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Error loading survey templates:", error);
      toast({ 
        title: "Hata", 
        description: "Anket şablonları yüklenemedi", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadTemplates(abortController.signal);
    return () => abortController.abort();
  }, []);

  return {
    templates,
    loading,
    refresh: loadTemplates
  };
}
