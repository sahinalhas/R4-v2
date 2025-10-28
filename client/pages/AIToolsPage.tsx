import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Bot, Brain, Sparkles, CalendarDays } from 'lucide-react';
import { AIToolsLoadingState } from '@/components/ai-tools/AIToolsLoadingState';
import { PageHeader } from '@/components/ui/page-header';

const RiskDashboard = lazy(() => import('./RiskDashboard'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const AIInsightsDashboard = lazy(() => import('./AIInsightsDashboard'));
const AdvancedAIAnalysis = lazy(() => import('./AdvancedAIAnalysis'));
const DailyActionPlan = lazy(() => import('./DailyActionPlan'));

const AI_TOOLS_TABS = [
  {
    value: 'risk',
    label: 'Risk Takip',
    icon: ShieldAlert,
    description: 'Risk analizi ve takip araçları'
  },
  {
    value: 'ai-asistan',
    label: 'AI Asistan',
    icon: Bot,
    description: 'Yapay zeka destekli asistan'
  },
  {
    value: 'ai-insights',
    label: 'Günlük AI',
    icon: Brain,
    description: 'Günlük yapay zeka içgörüleri'
  },
  {
    value: 'gelismis-analiz',
    label: 'Derinlemesine',
    icon: Sparkles,
    description: 'Gelişmiş analiz araçları'
  },
  {
    value: 'gunluk-plan',
    label: 'Günlük Plan',
    icon: CalendarDays,
    description: 'Günlük eylem planı'
  }
] as const;

const VALID_TABS = ['risk', 'ai-asistan', 'ai-insights', 'gelismis-analiz', 'gunluk-plan'] as const;

export default function AIToolsPage() {
  const [searchParams] = useSearchParams();
  
  // Read initial tab from URL, but default to 'risk' if invalid
  const getValidTab = (tab: string | null): string => {
    if (tab && VALID_TABS.includes(tab as any)) {
      return tab;
    }
    return 'risk';
  };

  const initialTab = getValidTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab if URL changes (e.g., from navigation)
  // Only watch searchParams, not activeTab, to avoid reverting user's manual tab changes
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const validTab = getValidTab(urlTab);
    setActiveTab(validTab);
  }, [searchParams]);

  // Handle tab change - only update local state, don't modify URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 space-y-6"
    >
      <PageHeader
        icon={Brain}
        title="AI Araçları"
        subtitle="Yapay zeka destekli analiz, raporlama ve asistan araçları"
      />

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        {/* Responsive Tab List */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {AI_TOOLS_TABS.map(({ value, label }) => (
            <TabsTrigger 
              key={value} 
              value={value}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="risk" className="mt-0 min-h-[600px]">
          <Suspense fallback={<AIToolsLoadingState icon={ShieldAlert} message="Risk verileri yükleniyor..." />}>
            <RiskDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai-asistan" className="mt-0 min-h-[600px]">
          <Suspense fallback={<AIToolsLoadingState icon={Bot} message="AI Asistan yükleniyor..." />}>
            <AIAssistant />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-0 min-h-[600px]">
          <Suspense fallback={<AIToolsLoadingState icon={Brain} message="Günlük insights yükleniyor..." />}>
            <AIInsightsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="gelismis-analiz" className="mt-0 min-h-[600px]">
          <Suspense fallback={<AIToolsLoadingState icon={Sparkles} message="Gelişmiş analiz yükleniyor..." />}>
            <AdvancedAIAnalysis />
          </Suspense>
        </TabsContent>

        <TabsContent value="gunluk-plan" className="mt-0 min-h-[600px]">
          <Suspense fallback={<AIToolsLoadingState icon={CalendarDays} message="Günlük plan yükleniyor..." />}>
            <DailyActionPlan />
          </Suspense>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
