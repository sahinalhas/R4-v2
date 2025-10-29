import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ExamType,
  ExamSubject,
  ExamSession,
  ExamResult,
  ExamResultWithDetails,
  SchoolExamResult,
  CreateExamSessionInput,
  UpdateExamSessionInput,
  CreateExamResultInput,
  UpdateExamResultInput,
  CreateSchoolExamResultInput,
  UpdateSchoolExamResultInput,
  ExamManagementApiResponse,
  ExamStatistics,
  StudentExamStatistics,
  DashboardOverview,
  SessionComparison,
  TrendAnalysis,
} from '../../shared/types/exam-management.types';

const API_BASE = '/api/exam-management';

export function useExamTypes() {
  return useQuery<ExamType[]>({
    queryKey: [API_BASE, 'types'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/types`);
      if (!response.ok) throw new Error('Sınav türleri yüklenemedi');
      const data: ExamManagementApiResponse<ExamType[]> = await response.json();
      return data.data || [];
    },
  });
}

export function useExamSubjects(examTypeId: string | undefined) {
  return useQuery<ExamSubject[]>({
    queryKey: [API_BASE, 'types', examTypeId, 'subjects'],
    queryFn: async () => {
      if (!examTypeId) return [];
      const response = await fetch(`${API_BASE}/types/${examTypeId}/subjects`);
      if (!response.ok) throw new Error('Dersler yüklenemedi');
      const data: ExamManagementApiResponse<ExamSubject[]> = await response.json();
      return data.data || [];
    },
    enabled: !!examTypeId,
  });
}

export function useExamSessions(examTypeId?: string) {
  return useQuery<ExamSession[]>({
    queryKey: [API_BASE, 'sessions', examTypeId],
    queryFn: async () => {
      const url = examTypeId 
        ? `${API_BASE}/sessions?typeId=${examTypeId}`
        : `${API_BASE}/sessions`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Deneme sınavları yüklenemedi');
      const data: ExamManagementApiResponse<ExamSession[]> = await response.json();
      return data.data || [];
    },
  });
}

export function useExamSession(sessionId: string | undefined) {
  return useQuery<ExamSession>({
    queryKey: [API_BASE, 'sessions', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID gerekli');
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Deneme sınavı yüklenemedi');
      const data: ExamManagementApiResponse<ExamSession> = await response.json();
      if (!data.data) throw new Error('Deneme sınavı bulunamadı');
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useCreateExamSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateExamSessionInput) => {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Deneme sınavı oluşturulamadı');
      const data: ExamManagementApiResponse<ExamSession> = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'sessions'] });
    },
  });
}

export function useUpdateExamSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateExamSessionInput }) => {
      const response = await fetch(`${API_BASE}/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Deneme sınavı güncellenemedi');
      const data: ExamManagementApiResponse<ExamSession> = await response.json();
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'sessions'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'sessions', variables.id] });
    },
  });
}

export function useDeleteExamSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Deneme sınavı silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'sessions'] });
    },
  });
}

export function useExamResultsBySession(sessionId: string | undefined) {
  return useQuery<ExamResultWithDetails[]>({
    queryKey: [API_BASE, 'results', 'session', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await fetch(`${API_BASE}/results/session/${sessionId}`);
      if (!response.ok) throw new Error('Sınav sonuçları yüklenemedi');
      const data: ExamManagementApiResponse<ExamResultWithDetails[]> = await response.json();
      return data.data || [];
    },
    enabled: !!sessionId,
  });
}

export function useExamResultsByStudent(studentId: string | undefined) {
  return useQuery<ExamResultWithDetails[]>({
    queryKey: [API_BASE, 'results', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await fetch(`${API_BASE}/results/student/${studentId}`);
      if (!response.ok) throw new Error('Öğrenci sınav sonuçları yüklenemedi');
      const data: ExamManagementApiResponse<ExamResultWithDetails[]> = await response.json();
      return data.data || [];
    },
    enabled: !!studentId,
  });
}

export function useExamResultsBySessionAndStudent(sessionId: string | undefined, studentId: string | undefined) {
  return useQuery<ExamResult[]>({
    queryKey: [API_BASE, 'results', 'session', sessionId, 'student', studentId],
    queryFn: async () => {
      if (!sessionId || !studentId) return [];
      const response = await fetch(`${API_BASE}/results/session/${sessionId}/student/${studentId}`);
      if (!response.ok) throw new Error('Öğrenci sınav sonuçları yüklenemedi');
      const data: ExamManagementApiResponse<ExamResult[]> = await response.json();
      return data.data || [];
    },
    enabled: !!sessionId && !!studentId,
  });
}

export function useUpsertExamResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateExamResultInput) => {
      const response = await fetch(`${API_BASE}/results/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Sonuç kaydedilemedi');
      const data: ExamManagementApiResponse<ExamResult> = await response.json();
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'results', 'session', variables.session_id] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'results', 'student', variables.student_id] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'statistics'] });
    },
  });
}

export function useBatchUpsertResults() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (results: CreateExamResultInput[]) => {
      const response = await fetch(`${API_BASE}/results/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });
      if (!response.ok) throw new Error('Sonuçlar kaydedilemedi');
      const data: ExamManagementApiResponse<ExamResult[]> = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'results'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'statistics'] });
    },
  });
}

export function useDeleteExamResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resultId: string) => {
      const response = await fetch(`${API_BASE}/results/${resultId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Sonuç silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'results'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'statistics'] });
    },
  });
}

export function useSessionStatistics(sessionId: string | undefined) {
  return useQuery<ExamStatistics>({
    queryKey: [API_BASE, 'statistics', 'session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID gerekli');
      const response = await fetch(`${API_BASE}/statistics/session/${sessionId}`);
      if (!response.ok) throw new Error('İstatistik hesaplanamadı');
      const data: ExamManagementApiResponse<ExamStatistics> = await response.json();
      if (!data.data) throw new Error('İstatistik bulunamadı');
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useStudentStatistics(studentId: string | undefined, examTypeId?: string) {
  return useQuery<StudentExamStatistics>({
    queryKey: [API_BASE, 'statistics', 'student', studentId, examTypeId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID gerekli');
      const url = examTypeId
        ? `${API_BASE}/statistics/student/${studentId}?examTypeId=${examTypeId}`
        : `${API_BASE}/statistics/student/${studentId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('İstatistik hesaplanamadı');
      const data: ExamManagementApiResponse<StudentExamStatistics> = await response.json();
      if (!data.data) throw new Error('İstatistik bulunamadı');
      return data.data;
    },
    enabled: !!studentId,
  });
}

export function useSchoolExamsByStudent(studentId: string | undefined) {
  return useQuery<SchoolExamResult[]>({
    queryKey: [API_BASE, 'school-exams', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await fetch(`${API_BASE}/school-exams/student/${studentId}`);
      if (!response.ok) throw new Error('Okul sınav sonuçları yüklenemedi');
      const data: ExamManagementApiResponse<SchoolExamResult[]> = await response.json();
      return data.data || [];
    },
    enabled: !!studentId,
  });
}

export function useCreateSchoolExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSchoolExamResultInput) => {
      const response = await fetch(`${API_BASE}/school-exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Okul sınav sonucu kaydedilemedi');
      const data: ExamManagementApiResponse<SchoolExamResult> = await response.json();
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'school-exams', 'student', variables.student_id] });
    },
  });
}

export function useUpdateSchoolExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSchoolExamResultInput }) => {
      const response = await fetch(`${API_BASE}/school-exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Okul sınav sonucu güncellenemedi');
      const data: ExamManagementApiResponse<SchoolExamResult> = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'school-exams'] });
    },
  });
}

export function useDeleteSchoolExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (examId: string) => {
      const response = await fetch(`${API_BASE}/school-exams/${examId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Okul sınav sonucu silinemedi');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'school-exams'] });
    },
  });
}

export function useImportExcelResults() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, file }: { sessionId: string; file: File }) => {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE}/excel/import`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Excel dosyası işlenemedi');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'results'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'statistics'] });
    },
  });
}

export function downloadExcelTemplate(examTypeId: string, includeStudents: boolean = false) {
  const url = `${API_BASE}/excel/template/${examTypeId}?includeStudents=${includeStudents}`;
  window.open(url, '_blank');
}

export function downloadExcelResults(sessionId: string) {
  const url = `${API_BASE}/excel/export/${sessionId}`;
  window.open(url, '_blank');
}

export function useDashboardOverview() {
  return useQuery<DashboardOverview>({
    queryKey: [API_BASE, 'dashboard', 'overview'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/dashboard/overview`);
      if (!response.ok) throw new Error('Dashboard verileri yüklenemedi');
      const data: ExamManagementApiResponse<DashboardOverview> = await response.json();
      if (!data.data) throw new Error('Dashboard verileri bulunamadı');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSessionComparison() {
  return useMutation({
    mutationFn: async (params: { 
      sessionIds: string[]; 
      comparisonType?: 'overall' | 'subject' | 'student';
    }) => {
      const response = await fetch(`${API_BASE}/comparison/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionIds: params.sessionIds,
          comparisonType: params.comparisonType || 'overall'
        }),
      });
      if (!response.ok) throw new Error('Karşılaştırma yapılamadı');
      const data: ExamManagementApiResponse<SessionComparison> = await response.json();
      if (!data.data) throw new Error('Karşılaştırma verileri bulunamadı');
      return data.data;
    },
  });
}

export function useTrendAnalysis(examTypeId: string | undefined, period: 'last_6' | 'last_12' | 'all' = 'last_6') {
  return useQuery<TrendAnalysis>({
    queryKey: [API_BASE, 'trend', examTypeId, period],
    queryFn: async () => {
      if (!examTypeId) throw new Error('Sınav türü gerekli');
      const response = await fetch(`${API_BASE}/trend/${examTypeId}?period=${period}`);
      if (!response.ok) throw new Error('Trend analizi yapılamadı');
      const data: ExamManagementApiResponse<TrendAnalysis> = await response.json();
      if (!data.data) throw new Error('Trend analizi bulunamadı');
      return data.data;
    },
    enabled: !!examTypeId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useStudentRiskAnalysis(studentId: string | undefined) {
  return useQuery({
    queryKey: [API_BASE, 'ai', 'risk', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Öğrenci ID gerekli');
      const response = await fetch(`${API_BASE}/ai/risk/${studentId}`);
      if (!response.ok) throw new Error('Risk analizi yapılamadı');
      const data = await response.json();
      return data.data;
    },
    enabled: !!studentId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useWeakSubjectsAnalysis(studentId: string | undefined) {
  return useQuery({
    queryKey: [API_BASE, 'ai', 'weak-subjects', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Öğrenci ID gerekli');
      const response = await fetch(`${API_BASE}/ai/weak-subjects/${studentId}`);
      if (!response.ok) throw new Error('Zayıf konu analizi yapılamadı');
      const data = await response.json();
      return data.data;
    },
    enabled: !!studentId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSessionRecommendations(sessionId: string | undefined) {
  return useQuery({
    queryKey: [API_BASE, 'ai', 'recommendations', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Deneme ID gerekli');
      const response = await fetch(`${API_BASE}/ai/recommendations/${sessionId}`);
      if (!response.ok) throw new Error('Öneri oluşturulamadı');
      const data = await response.json();
      return data.data;
    },
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000,
  });
}
