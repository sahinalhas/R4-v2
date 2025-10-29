import { useMemo } from 'react';

interface Student {
  id: string;
  name?: string;
  ad?: string;
  soyad?: string;
}

export function useStudentFilter<T extends Student>(
  students: T[],
  searchQuery: string
): T[] {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }

    const query = searchQuery.toLowerCase();
    return students.filter((student) => {
      const name = student.name || `${student.ad || ''} ${student.soyad || ''}`.trim();
      const id = student.id || '';
      
      return (
        name.toLowerCase().includes(query) ||
        id.toLowerCase().includes(query)
      );
    });
  }, [students, searchQuery]);
}
