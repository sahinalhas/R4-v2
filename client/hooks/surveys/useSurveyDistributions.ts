import { useState, useEffect } from "react";
import { SurveyDistribution } from "@/lib/survey-types";
import { surveyService } from "@/services/surveyService";
import { useToast } from "@/hooks/use-toast";

export function useSurveyDistributions() {
  const { toast } = useToast();
  const [distributions, setDistributions] = useState<SurveyDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDistributions = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await surveyService.getDistributions(signal);
      setDistributions(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error("Error loading survey distributions:", error);
      toast({ 
        title: "Hata", 
        description: "Anket dağıtımları yüklenemedi", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadDistributions(abortController.signal);
    return () => abortController.abort();
  }, []);

  return {
    distributions,
    loading,
    refresh: loadDistributions
  };
}
