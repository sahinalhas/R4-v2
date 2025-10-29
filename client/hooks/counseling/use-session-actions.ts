import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type {
  IndividualSessionFormValues,
  GroupSessionFormValues,
  CompleteSessionFormValues,
  ReminderFormValues,
  FollowUpFormValues,
  OutcomeFormValues,
} from '@/components/counseling/types';
import { getCurrentClassHour } from '@/components/counseling/utils/sessionHelpers';
import type { ClassHour } from '@/components/counseling/types';

export function useSessionActions(classHours: ClassHour[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async (data: {
      sessionType: 'individual' | 'group';
      formData: IndividualSessionFormValues | GroupSessionFormValues;
    }) => {
      const currentClassHour = getCurrentClassHour(classHours);
      
      const sessionDate = data.formData.sessionDate instanceof Date 
        ? format(data.formData.sessionDate, 'yyyy-MM-dd')
        : data.formData.sessionDate;
      
      const { sessionDate: _, sessionTime: __, ...restData } = data.formData;
      
      const payload = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionType: data.sessionType,
        counselorId: "user_1",
        sessionDate,
        entryTime: data.formData.sessionTime,
        entryClassHourId: currentClassHour?.id,
        ...restData,
        studentIds: data.sessionType === 'individual' 
          ? [(data.formData as IndividualSessionFormValues).studentId]
          : (data.formData as GroupSessionFormValues).studentIds,
      };

      const response = await fetch('/api/counseling-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Görüşme oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions'] });
      toast({
        title: "✅ Görüşme başlatıldı",
        description: "Rehberlik görüşmesi başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteSessionFormValues }) => {
      const currentClassHour = getCurrentClassHour(classHours);
      const payload = {
        ...data,
        exitClassHourId: currentClassHour?.id,
      };

      const response = await fetch(`/api/counseling-sessions/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Görüşme tamamlanamadı');
      }

      return { result: await response.json(), completionData: data };
    },
    onSuccess: async (responseData, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions'] });
      
      // Takip gerekli ise otomatik hatırlatıcı oluştur
      if (responseData.completionData.followUpNeeded && 
          responseData.completionData.followUpDate && 
          responseData.completionData.followUpTime) {
        
        const session = await fetch(`/api/counseling-sessions/${variables.id}`).then(r => r.json());
        
        const reminderData = {
          id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: variables.id,
          reminderType: 'follow_up',
          reminderDate: format(responseData.completionData.followUpDate, 'yyyy-MM-dd'),
          reminderTime: responseData.completionData.followUpTime,
          title: `Takip Görüşmesi: ${session.student?.name || session.groupName || 'Görüşme'}`,
          description: responseData.completionData.followUpPlan || 'Takip görüşmesi planlandı',
          studentIds: JSON.stringify(session.sessionType === 'individual' 
            ? [session.student?.id] 
            : session.students?.map((s: any) => s.id) || []
          ),
          status: 'pending',
          notificationSent: 0
        };

        await fetch('/api/counseling-sessions/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reminderData),
        });

        queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/reminders'] });
        
        toast({
          title: "✅ Görüşme tamamlandı ve randevu oluşturuldu",
          description: `Takip görüşmesi ${format(responseData.completionData.followUpDate, 'd MMMM yyyy', { locale: tr })} - ${responseData.completionData.followUpTime} için planlandı.`,
        });
      } else {
        toast({
          title: "✅ Görüşme tamamlandı",
          description: "Görüşme Defteri'nde tamamlanan görüşmeyi görüntüleyebilirsiniz.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const extendSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/counseling-sessions/${sessionId}/extend`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Görüşme uzatılamadı');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions'] });
      toast({
        title: "✅ Görüşme uzatıldı",
        description: "15 dakika ek süre tanındı.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: ReminderFormValues) => {
      const reminderDate = data.reminderDate instanceof Date 
        ? format(data.reminderDate, 'yyyy-MM-dd')
        : data.reminderDate;
      
      const payload = {
        ...data,
        reminderDate,
        studentIds: JSON.stringify(data.studentIds),
      };

      const response = await fetch('/api/counseling-sessions/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hatırlatma oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/reminders'] });
      toast({
        title: "✅ Hatırlatma oluşturuldu",
        description: "Hatırlatma başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReminderFormValues }) => {
      const reminderDate = data.reminderDate instanceof Date 
        ? format(data.reminderDate, 'yyyy-MM-dd')
        : data.reminderDate;
      
      const payload = {
        ...data,
        reminderDate,
        studentIds: JSON.stringify(data.studentIds),
      };

      const response = await fetch(`/api/counseling-sessions/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hatırlatma güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/reminders'] });
      toast({
        title: "✅ Hatırlatma güncellendi",
        description: "Hatırlatma başarıyla güncellendi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const updateReminderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'completed' | 'cancelled' }) => {
      const response = await fetch(`/api/counseling-sessions/reminders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hatırlatma durumu güncellenemedi');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/reminders'] });
      const statusLabels = {
        completed: 'tamamlandı',
        cancelled: 'iptal edildi',
        pending: 'beklemede',
      };
      toast({
        title: "✅ Durum güncellendi",
        description: `Hatırlatma ${statusLabels[variables.status]} olarak işaretlendi.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async (data: FollowUpFormValues) => {
      const followUpDate = data.followUpDate instanceof Date 
        ? format(data.followUpDate, 'yyyy-MM-dd')
        : data.followUpDate;
      
      const payload = {
        ...data,
        followUpDate,
      };

      const response = await fetch('/api/counseling-sessions/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Takip oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/follow-ups'] });
      toast({
        title: "✅ Takip oluşturuldu",
        description: "Takip görevi başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FollowUpFormValues }) => {
      const followUpDate = data.followUpDate instanceof Date 
        ? format(data.followUpDate, 'yyyy-MM-dd')
        : data.followUpDate;
      
      const payload = {
        ...data,
        followUpDate,
      };

      const response = await fetch(`/api/counseling-sessions/follow-ups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Takip güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/follow-ups'] });
      toast({
        title: "✅ Takip güncellendi",
        description: "Takip görevi başarıyla güncellendi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const updateFollowUpStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'in_progress' | 'completed' }) => {
      const response = await fetch(`/api/counseling-sessions/follow-ups/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Takip durumu güncellenemedi');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/follow-ups'] });
      const statusLabels = {
        pending: 'beklemede',
        in_progress: 'devam ediyor',
        completed: 'tamamlandı',
      };
      toast({
        title: "✅ Durum güncellendi",
        description: `Takip ${statusLabels[variables.status]} olarak işaretlendi.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const createOutcomeMutation = useMutation({
    mutationFn: async (data: OutcomeFormValues) => {
      const followUpDate = data.followUpDate instanceof Date 
        ? format(data.followUpDate, 'yyyy-MM-dd')
        : data.followUpDate;
      
      const payload = {
        id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        followUpDate,
      };

      const response = await fetch('/api/counseling-sessions/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sonuç kaydedilemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/outcomes'] });
      toast({
        title: "✅ Sonuç kaydedildi",
        description: "Görüşme sonucu başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const updateOutcomeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OutcomeFormValues }) => {
      const followUpDate = data.followUpDate instanceof Date 
        ? format(data.followUpDate, 'yyyy-MM-dd')
        : data.followUpDate;
      
      const payload = {
        ...data,
        followUpDate,
      };

      const response = await fetch(`/api/counseling-sessions/outcomes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sonuç güncellenemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/outcomes'] });
      toast({
        title: "✅ Sonuç güncellendi",
        description: "Görüşme sonucu başarıyla güncellendi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  const deleteOutcomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/counseling-sessions/outcomes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sonuç silinemedi');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions/outcomes'] });
      toast({
        title: "✅ Sonuç silindi",
        description: "Görüşme sonucu başarıyla silindi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Hata",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    },
  });

  return {
    createSessionMutation,
    completeSessionMutation,
    extendSessionMutation,
    createReminderMutation,
    updateReminderMutation,
    updateReminderStatusMutation,
    createFollowUpMutation,
    updateFollowUpMutation,
    updateFollowUpStatusMutation,
    createOutcomeMutation,
    updateOutcomeMutation,
    deleteOutcomeMutation,
  };
}
