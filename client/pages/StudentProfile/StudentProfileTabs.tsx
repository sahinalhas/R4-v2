/**
 * Student Profile Tabs - Clean & Simple Design
 * 9 Ana Sekme Yapısı - Bilgi Tekrarı YOK
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAIN_TABS } from "./constants";
import { StudentData } from "@/hooks/student-profile";
import { Student } from "@/lib/storage";

// Yeni Modern Component'ler
import UnifiedIdentitySection from "@/components/student-profile/sections/UnifiedIdentitySection";
import EnhancedHealthSection from "@/components/student-profile/sections/EnhancedHealthSection";
import SmartAcademicDashboard from "@/components/student-profile/sections/SmartAcademicDashboard";
import DevelopmentProfileSection from "@/components/student-profile/sections/DevelopmentProfileSection";
import EnhancedRiskDashboard from "@/components/student-profile/sections/EnhancedRiskDashboard";
import CareerFutureSection from "@/components/student-profile/sections/CareerFutureSection";
import CommunicationCenter from "@/components/student-profile/sections/CommunicationCenter";
import AdditionalInfoSection from "@/components/student-profile/sections/AdditionalInfoSection"; // Import AdditionalInfoSection

// Dashboard
import { ModernDashboard } from "./components/ModernDashboard";

// Eski component'ler (geçici - sonra kaldırılacak)
import OzelEgitimSection from "@/components/student-profile/sections/OzelEgitimSection";

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
    <Tabs defaultValue="dashboard" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-8">
        {MAIN_TABS.map(({ value, label, description }) => (
          <TabsTrigger
            key={value}
            value={value}
            title={description}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* 1. DASHBOARD - Özet Görünüm */}
      <TabsContent value="dashboard" className="space-y-4">
        <ModernDashboard
          student={student}
          studentId={studentId}
          scoresData={scoresData}
          loadingScores={loadingScores}
        />
      </TabsContent>

      {/* 2. KİMLİK & İLETİŞİM */}
      <TabsContent value="kimlik" className="space-y-4">
        <UnifiedIdentitySection
          student={student}
          onUpdate={onUpdate}
        />
        <AdditionalInfoSection
          student={student}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 3. SAĞLIK & GÜVENLİK */}
      <TabsContent value="saglik" className="space-y-4">
        <EnhancedHealthSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
        <OzelEgitimSection
          studentId={studentId}
          specialEducation={data.specialEducation || []}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 4. AKADEMİK */}
      <TabsContent value="akademik" className="space-y-4">
        <SmartAcademicDashboard
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 5. GELİŞİM & KİŞİLİK */}
      <TabsContent value="gelisim" className="space-y-4">
        <DevelopmentProfileSection
          studentId={studentId}
          multipleIntelligence={data.multipleIntelligence}
          evaluations360={data.evaluations360}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 6. RİSK & MÜDAHALE */}
      <TabsContent value="risk" className="space-y-4">
        <EnhancedRiskDashboard
          studentId={studentId}
          student={student}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 7. KARİYER & GELECEK */}
      <TabsContent value="kariyer" className="space-y-4">
        <CareerFutureSection
          studentId={studentId}
          studentName={studentName}
          academicGoals={data.academicGoals}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* 8. İLETİŞİM MERKEZİ */}
      <TabsContent value="iletisim" className="space-y-4">
        <CommunicationCenter
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}