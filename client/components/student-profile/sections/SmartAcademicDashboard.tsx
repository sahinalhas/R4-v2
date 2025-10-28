/**
 * Smart Academic Dashboard
 * Akademik performans özeti - mevcut akademik sekmelerini organize eder
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AKADEMIK_TABS, TAB_COLORS } from "@/pages/StudentProfile/constants";
import StandardizedAcademicSection from "./StandardizedAcademicSection";
import StudentExamResultsSection from "./StudentExamResultsSection";
import CalismaProgramiSection from "./CalismaProgramiSection";
import IlerlemeTakibiSection from "./IlerlemeTakibiSection";
import AnketlerSection from "./AnketlerSection";

interface SmartAcademicDashboardProps {
  studentId: string;
  onUpdate: () => void;
}

export default function SmartAcademicDashboard({
  studentId,
  onUpdate
}: SmartAcademicDashboardProps) {
  return (
    <Tabs defaultValue="performans" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        {AKADEMIK_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="performans" className="space-y-4">
        <StandardizedAcademicSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="sinavlar" className="space-y-4">
        <StudentExamResultsSection studentId={studentId} />
      </TabsContent>

      <TabsContent value="calisma-programi" className="space-y-4">
        <CalismaProgramiSection studentId={studentId} />
      </TabsContent>

      <TabsContent value="ilerleme" className="space-y-4">
        <IlerlemeTakibiSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="anketler" className="space-y-4">
        <AnketlerSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}
