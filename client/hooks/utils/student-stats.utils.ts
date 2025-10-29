import { useMemo } from 'react';
import type { Student } from '@/lib/storage';

export interface StudentStats {
  total: number;
  female: number;
  male: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  classCounts: Record<string, number>;
  newThisMonth: number;
  newThisWeek: number;
}

export function useStudentStats(students: Student[]): StudentStats {
  return useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: StudentStats = {
      total: students.length,
      female: 0,
      male: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      classCounts: {},
      newThisMonth: 0,
      newThisWeek: 0,
    };

    students.forEach((student) => {
      if (student.cinsiyet === 'K') stats.female++;
      else if (student.cinsiyet === 'E') stats.male++;

      const risk = student.risk || 'Düşük';
      if (risk === 'Yüksek') stats.highRisk++;
      else if (risk === 'Orta') stats.mediumRisk++;
      else stats.lowRisk++;

      const classValue = student.class || '';
      const classBase = classValue ? (classValue.split('/')[0] || classValue) : 'Belirtilmemiş';
      stats.classCounts[classBase] = (stats.classCounts[classBase] || 0) + 1;

      if (student.kayitTarihi) {
        const kayitDate = new Date(student.kayitTarihi);
        if (kayitDate >= monthAgo) stats.newThisMonth++;
        if (kayitDate >= weekAgo) stats.newThisWeek++;
      }
    });

    return stats;
  }, [students]);
}
