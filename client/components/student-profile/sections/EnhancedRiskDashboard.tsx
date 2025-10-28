/**
 * Enhanced Risk Dashboard
 * Otomatik risk hesaplama, davranış analizi, koruyucu faktörler, müdahale planları
 * NOT: Manuel risk girişi YOK - tüm risk bilgileri otomatik hesaplanır
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TAB_COLORS } from "@/pages/StudentProfile/constants";
import UnifiedRiskSection from "./UnifiedRiskSection";
import { Student } from "@/lib/storage";

interface EnhancedRiskDashboardProps {
  studentId: string;
  student: Student;
  onUpdate: () => void;
}

export default function EnhancedRiskDashboard({
  studentId,
  student,
  onUpdate
}: EnhancedRiskDashboardProps) {
  return (
    <div className="space-y-6">
      <UnifiedRiskSection
        studentId={studentId}
        student={student}
        onUpdate={onUpdate}
      />
    </div>
  );
}
