/**
 * Student Profile Tabs - Clean & Simple Design
 * 9 Ana Sekme Yapısı - Bilgi Tekrarı YOK
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { MAIN_TABS } from "./constants";
import { StudentData } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";

// Yeni Modern Component'ler
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";
import EnhancedHealthSection from "@/components/features/student-profile/sections/EnhancedHealthSection";
import SmartAcademicDashboard from "@/components/features/student-profile/sections/SmartAcademicDashboard";
import DevelopmentProfileSection from "@/components/features/student-profile/sections/DevelopmentProfileSection";
import EnhancedRiskDashboard from "@/components/features/student-profile/sections/EnhancedRiskDashboard";
import CareerFutureSection from "@/components/features/student-profile/sections/CareerFutureSection";
import CommunicationCenter from "@/components/features/student-profile/sections/CommunicationCenter";
import AdditionalInfoSection from "@/components/features/student-profile/sections/AdditionalInfoSection";
import { ProfileCompletenessIndicator } from "@/components/features/student-profile/ProfileCompletenessIndicator";

// Dashboard
import { ModernDashboard } from "./components/ModernDashboard";

// Eski component'ler (geçici - sonra kaldırılacak)
import OzelEgitimSection from "@/components/features/student-profile/sections/OzelEgitimSection";

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
        {/* Profil Tamlığı Göstergesi - Dashboard'daki detaylı versiyonu buraya taşındı */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Profil Bütünlüğü Analizi</h3>
            <span className="text-sm text-muted-foreground">Eksik alanlar ve veri kalitesi</span>
          </div>
          <ProfileCompletenessIndicator
            overall={scoresData?.completeness?.overall ?? 0}
            sections={scoresData?.completeness?.sections || {}}
            eksikAlanlar={scoresData?.completeness?.eksikAlanlar || []}
          />
        </div>

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