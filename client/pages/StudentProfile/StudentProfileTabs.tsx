/**
 * Student Profile Tabs - Optimized Structure
 * 6 Ana Sekme - Yeni Mantıksal Yapı
 * Bilgi Tekrarı YOK - Rehber Öğretmen İş Akışına Göre Optimize
 * 
 * Tarih: 30 Ekim 2025
 * Optimizasyon: 8 sekme → 6 sekme (%25 azalma)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { MAIN_TABS } from "./constants";
import { StudentData } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";

import { OverviewTab } from "./tabs/OverviewTab";
import { IdentityFamilyTab } from "./tabs/IdentityFamilyTab";
import { AcademicsTab } from "./tabs/AcademicsTab";
import { WellbeingTab } from "./tabs/WellbeingTab";
import { RiskSupportTab } from "./tabs/RiskSupportTab";
import { CommunicationTab } from "./tabs/CommunicationTab";

interface StudentProfileTabsProps {
  student: Student;
  studentId: string;
  data: StudentData;
  onUpdate: () => void;
  scoresData?: any;
  loadingScores?: boolean;
}

export function StudentProfileTabs({
  student,
  studentId,
  data,
  onUpdate,
  scoresData,
  loadingScores,
}: StudentProfileTabsProps) {
  const studentName = `${student.ad} ${student.soyad}`;

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex flex-wrap gap-1 h-auto p-1.5 bg-muted/40">
        {MAIN_TABS.map(({ value, label, description }) => (
          <TabsTrigger
            key={value}
            value={value}
            title={description}
            className="px-3 py-1.5 text-xs font-medium data-[state=active]:shadow-sm"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* 1. GENEL BAKIŞ - 360° Durum Özeti */}
      <TabsContent value="overview" className="space-y-3">
        <OverviewTab
          student={student}
          studentId={studentId}
          scoresData={scoresData}
          loadingScores={loadingScores}
        />
      </TabsContent>

      {/* 2. KİMLİK & AİLE - Öğrenci ve Aile Bilgileri */}
      <TabsContent value="identity-family" className="space-y-3">
        <IdentityFamilyTab student={student} onUpdate={onUpdate} />
      </TabsContent>

      {/* 3. AKADEMİK - Notlar, Sınavlar, Devam */}
      <TabsContent value="academics" className="space-y-3">
        <AcademicsTab studentId={studentId} onUpdate={onUpdate} />
      </TabsContent>

      {/* 4. İYİLİK HALİ & GELİŞİM - Sağlık, Sosyal-Duygusal, Kariyer */}
      <TabsContent value="wellbeing" className="space-y-3">
        <WellbeingTab
          studentId={studentId}
          studentName={studentName}
          data={data}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 5. RİSK & MÜDAHALE - Risk Faktörleri, Davranış, Planlar */}
      <TabsContent value="risk-support" className="space-y-3">
        <RiskSupportTab
          studentId={studentId}
          student={student}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 6. İLETİŞİM & KAYITLAR - Görüşmeler, Notlar, Belgeler */}
      <TabsContent value="communication" className="space-y-3">
        <CommunicationTab
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}