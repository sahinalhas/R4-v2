import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, Target, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { getTodayActionPlan } from '@/lib/api/advanced-ai-analysis.api';

interface DailyActionPlanWidgetProps {
  onHide?: () => void;
}

export default function DailyActionPlanWidget({ onHide }: DailyActionPlanWidgetProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const data = await getTodayActionPlan();
      setPlan(data);
    } catch (error) {
      console.error('Günlük plan yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  if (loading) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Günlük Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Günlük Plan
            </CardTitle>
            <CardDescription>Henüz plan oluşturulmadı</CardDescription>
          </div>
          {onHide && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHide}>
              <EyeOff className="h-3 w-3" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Günlük eylem planı yüklenemedi.</p>
        </CardContent>
      </Card>
    );
  }

  const priorityStudents = plan.priorityStudents?.slice(0, 3) || [];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Sparkles className="h-5 w-5" />
            AI Günlük Plan
          </CardTitle>
          <CardDescription>Bugün için öneriler</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadPlan}>
            <RefreshCw className="h-3 w-3" />
          </Button>
          {onHide && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onHide}>
              <EyeOff className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorityStudents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Öncelikli Öğrenciler</span>
            </div>
            <div className="space-y-1">
              {priorityStudents.map((student: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate">{student.studentName}</span>
                  <Badge variant="outline" className="text-xs">
                    {student.urgencyLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {plan.upcomingDeadlines && plan.upcomingDeadlines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Yaklaşan Görevler</span>
            </div>
            <div className="space-y-1">
              {plan.upcomingDeadlines.slice(0, 2).map((task: any, i: number) => (
                <div key={i} className="text-xs">
                  <p className="truncate">{task.task}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {plan.recommendedActions && plan.recommendedActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Önerilen Aksiyonlar</span>
            </div>
            <div className="space-y-1">
              {plan.recommendedActions.slice(0, 2).map((action: string, i: number) => (
                <p key={i} className="text-xs truncate">{action}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
