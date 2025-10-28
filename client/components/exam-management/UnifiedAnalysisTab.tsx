import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, GitCompare, TrendingUp } from 'lucide-react';
import { StatisticsTab } from './StatisticsTab';
import { ComparisonAnalysisTab } from './ComparisonAnalysisTab';
import { TrendAnalysisTab } from './TrendAnalysisTab';
import type {
  ExamType,
  ExamSession,
  ExamStatistics as ExamStatisticsType,
} from '../../../shared/types/exam-management.types';

interface UnifiedAnalysisTabProps {
  examTypes: ExamType[];
  sessions: ExamSession[];
  statistics: ExamStatisticsType | null;
  isLoading: boolean;
  onSessionChange: (sessionId: string) => void;
  selectedSessionId?: string;
}

export function UnifiedAnalysisTab({
  examTypes,
  sessions,
  statistics,
  isLoading,
  onSessionChange,
  selectedSessionId,
}: UnifiedAnalysisTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>('statistics');

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analiz Merkezi
          </CardTitle>
          <CardDescription>
            İstatistikler, karşılaştırmalar ve trend analizlerine tek yerden erişin
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                İstatistikler
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <GitCompare className="h-4 w-4" />
                Karşılaştırma
              </TabsTrigger>
              <TabsTrigger value="trend" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trend Analizi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="statistics" className="mt-0">
              <StatisticsTab
                examTypes={examTypes}
                sessions={sessions}
                statistics={statistics}
                isLoading={isLoading}
                onSessionChange={onSessionChange}
                selectedSessionId={selectedSessionId}
              />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <ComparisonAnalysisTab
                examTypes={examTypes}
                sessions={sessions}
              />
            </TabsContent>

            <TabsContent value="trend" className="mt-0">
              <TrendAnalysisTab
                examTypes={examTypes}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
