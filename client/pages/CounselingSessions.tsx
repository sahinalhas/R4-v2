import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  SessionCalendar,
  SessionSearch,
  SessionCardView,
  SessionDrawer,
  SessionStatsCards,
  EnhancedSessionsTable,
  EnhancedSessionAnalytics,
  StatsCardSkeleton,
  CalendarSkeleton,
  TableSkeleton,
  SessionGridSkeleton,
} from "@/components/counseling/modern";

import ActiveSessionsGrid from "@/components/counseling/ActiveSessionsGrid";
import NewSessionDialog from "@/components/counseling/NewSessionDialog";
import EnhancedCompleteSessionDialog from "@/components/counseling/enhanced/EnhancedCompleteSessionDialog";
import ReminderDialog from "@/components/counseling/ReminderDialog";
import FollowUpDialog from "@/components/counseling/FollowUpDialog";
import SessionOutcomeDialog from "@/components/counseling/SessionOutcomeDialog";
import RemindersTab from "@/components/counseling/RemindersTab";
import OutcomesTab from "@/components/counseling/OutcomesTab";
import ReportGenerationDialog, { type ReportOptions } from "@/components/counseling/ReportGenerationDialog";

import { useSessionStats } from "@/hooks/counseling/useSessionStats";
import { useSessionFilters } from "@/hooks/counseling/useSessionFilters";
import { useSessionActions } from "@/hooks/counseling/useSessionActions";

import { getElapsedTime, getSessionName } from "@/components/counseling/utils/sessionHelpers";
import { exportSessionsToExcel } from "@/components/counseling/utils/sessionExport";
import { generateSessionsPDF, generateOutcomesPDF, generateComprehensiveReport } from "@/components/counseling/utils/sessionReports";

import type {
  CounselingSession,
  Student,
  ClassHour,
  CounselingTopic,
  IndividualSessionFormValues,
  GroupSessionFormValues,
  CompleteSessionFormValues,
  CounselingReminder,
  CounselingFollowUp,
  CounselingOutcome,
  ReminderFormValues,
  FollowUpFormValues,
  OutcomeFormValues,
} from "@/components/counseling/types";

import { apiClient } from "@/lib/api/api-client";
import { COUNSELING_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/constants/api-endpoints";

export default function CounselingSessions() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'cards'>('calendar');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionType, setSessionType] = useState<'individual' | 'group'>('individual');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [remindedSessions, setRemindedSessions] = useState<Set<string>>(new Set());
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<CounselingReminder | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState<CounselingFollowUp | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<(CounselingOutcome & { session?: CounselingSession }) | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<CounselingSession[]>({
    queryKey: [COUNSELING_ENDPOINTS.BASE],
    queryFn: () => apiClient.get<CounselingSession[]>(COUNSELING_ENDPOINTS.BASE, { showErrorToast: false }),
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: [STUDENT_ENDPOINTS.BASE],
    queryFn: () => apiClient.get<Student[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false }),
  });

  const { data: classHours = [] } = useQuery<ClassHour[]>({
    queryKey: ['/api/counseling-sessions/class-hours'],
    queryFn: () => apiClient.get<ClassHour[]>('/api/counseling-sessions/class-hours', { showErrorToast: false }),
  });

  const { data: topics = [] } = useQuery<CounselingTopic[]>({
    queryKey: [COUNSELING_ENDPOINTS.TOPICS],
    queryFn: () => apiClient.get<CounselingTopic[]>(COUNSELING_ENDPOINTS.TOPICS, { showErrorToast: false }),
  });

  const { data: reminders = [] } = useQuery<CounselingReminder[]>({
    queryKey: ['/api/counseling-sessions/reminders'],
    queryFn: async () => {
      const response = await fetch('/api/counseling-sessions/reminders');
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    },
  });

  const { data: followUps = [] } = useQuery<CounselingFollowUp[]>({
    queryKey: ['/api/counseling-sessions/follow-ups'],
    queryFn: async () => {
      const response = await fetch('/api/counseling-sessions/follow-ups');
      if (!response.ok) throw new Error('Failed to fetch follow-ups');
      return response.json();
    },
  });

  const { data: outcomes = [] } = useQuery<(CounselingOutcome & { session?: CounselingSession })[]>({
    queryKey: ['/api/counseling-sessions/outcomes'],
    queryFn: async () => {
      const response = await fetch('/api/counseling-sessions/outcomes');
      if (!response.ok) throw new Error('Failed to fetch outcomes');
      return response.json();
    },
  });

  const stats = useSessionStats(sessions);
  const { filteredSessions } = useSessionFilters(sessions);
  const actions = useSessionActions(classHours);

  const activeSessions = sessions.filter(s => !s.completed);
  const completedSessions = sessions.filter(s => s.completed);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/counseling-sessions'] });

      activeSessions.forEach(session => {
        const elapsed = getElapsedTime(session.entryTime, session.sessionDate);
        const limit = session.extensionGranted ? 75 : 60;
        const sessionKey = session.id;
        const sessionName = getSessionName(session);

        if (elapsed === 30 && !remindedSessions.has(`${sessionKey}-30`)) {
          toast({
            title: "⏰ 30 Dakika Geçti",
            description: `${sessionName} - Görüşme 30 dakikadır devam ediyor`,
          });
          setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-30`));
        }

        if (elapsed === 45 && !remindedSessions.has(`${sessionKey}-45`)) {
          toast({
            title: "⚠️ 45 Dakika Geçti",
            description: `${sessionName} - ${limit - elapsed} dakika sonra otomatik tamamlanacak`,
          });
          setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-45`));
        }

        if (elapsed === 55 && !remindedSessions.has(`${sessionKey}-55`)) {
          toast({
            title: "🔔 55 Dakika Geçti",
            description: `${sessionName} - ${limit - elapsed} dakika sonra otomatik tamamlanacak`,
            variant: "destructive",
          });
          setRemindedSessions(prev => new Set(prev).add(`${sessionKey}-55`));
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [activeSessions, remindedSessions, toast, queryClient]);

  const handleSelectSession = (session: CounselingSession) => {
    setSelectedSession(session);
    setDrawerOpen(true);
  };

  const handleCompleteSession = (session: CounselingSession) => {
    setSelectedSession(session);
    setDrawerOpen(false);
    setCompleteDialogOpen(true);
  };

  const handleCreateSession = (data: IndividualSessionFormValues | GroupSessionFormValues) => {
    actions.createSessionMutation.mutate(
      { sessionType, formData: data },
      {
        onSuccess: () => {
          setDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: [COUNSELING_ENDPOINTS.BASE] });
        },
      }
    );
  };

  const handleCompleteSubmit = (data: CompleteSessionFormValues) => {
    if (!selectedSession) return;
    actions.completeSessionMutation.mutate(
      { id: selectedSession.id, data },
      {
        onSuccess: () => {
          setCompleteDialogOpen(false);
          setSelectedSession(null);
          setActiveTab("journal");
        },
      }
    );
  };

  const handleExport = () => {
    const count = exportSessionsToExcel(sessions);
    toast({
      title: "✅ Excel dosyası oluşturuldu",
      description: `${count} görüşme kaydı başarıyla dışa aktarıldı.`,
    });
  };

  const handleGenerateReport = async (options: ReportOptions) => {
    try {
      let filteredSessions = sessions;
      let filteredOutcomes = outcomes;

      if (options.dateRange) {
        const { start, end } = options.dateRange;
        filteredSessions = sessions.filter(session => {
          const sessionDate = new Date(session.sessionDate);
          return sessionDate >= start && sessionDate <= end;
        });

        const sessionIds = new Set(filteredSessions.map(s => s.id));
        filteredOutcomes = outcomes.filter(outcome => sessionIds.has(outcome.sessionId));
      }

      let result;
      if (options.format === 'pdf') {
        if (options.includeSessions && options.includeOutcomes) {
          result = generateComprehensiveReport(filteredSessions, filteredOutcomes);
        } else if (options.includeSessions) {
          result = generateSessionsPDF(filteredSessions, [], { includeOutcomes: false });
        } else if (options.includeOutcomes) {
          result = generateOutcomesPDF(filteredOutcomes);
        }
      } else {
        const exportedCount = exportSessionsToExcel(filteredSessions);
        result = { success: true, sessionCount: exportedCount };
      }

      if (result?.success) {
        toast({
          title: "Rapor oluşturuldu",
          description: `${options.format.toUpperCase()} raporu başarıyla indirildi.`,
        });
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Hata",
        description: "Rapor oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rehberlik Görüşmeleri</h1>
          <p className="text-muted-foreground mt-1">
            Modern görüşme yönetimi ve analiz sistemi
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setSearchOpen(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <SearchIcon className="h-4 w-4" />
            Ara (⌘K)
          </Button>
          <Button 
            onClick={() => setReportDialogOpen(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Rapor
          </Button>
          <Button 
            onClick={() => setDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Yeni Görüşme
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
          <TabsTrigger value="dashboard">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif
            {activeSessions.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeSessions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="journal">
            Defter
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Hatırlatmalar
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SessionStatsCards stats={stats} isLoading={sessionsLoading} />
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Görüşme Takvimi</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                Takvim
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Tablo
              </Button>
              {isMobile && (
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Kartlar
                </Button>
              )}
            </div>
          </div>

          {sessionsLoading ? (
            viewMode === 'calendar' ? <CalendarSkeleton /> :
            viewMode === 'table' ? <TableSkeleton /> :
            <SessionGridSkeleton />
          ) : (
            <>
              {viewMode === 'calendar' && (
                <SessionCalendar
                  sessions={filteredSessions}
                  onSelectSession={handleSelectSession}
                  onSelectSlot={() => setDialogOpen(true)}
                />
              )}
              {viewMode === 'table' && (
                <EnhancedSessionsTable
                  sessions={filteredSessions}
                  topics={topics}
                  onExport={handleExport}
                  onSelectSession={handleSelectSession}
                />
              )}
              {viewMode === 'cards' && (
                <SessionCardView
                  sessions={filteredSessions}
                  onSelectSession={handleSelectSession}
                  onCompleteSession={handleCompleteSession}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ActiveSessionsGrid
            sessions={activeSessions}
            isLoading={sessionsLoading}
            onCompleteSession={handleCompleteSession}
            onExtendSession={(id) => actions.extendSessionMutation.mutate(id)}
            extendingSessionId={actions.extendSessionMutation.variables as string | undefined}
          />
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          {sessionsLoading ? (
            <TableSkeleton />
          ) : (
            <EnhancedSessionsTable
              sessions={completedSessions}
              topics={topics}
              onExport={handleExport}
              onSelectSession={handleSelectSession}
            />
          )}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <RemindersTab
            reminders={reminders}
            followUps={followUps}
            onCreateReminder={() => setReminderDialogOpen(true)}
            onCreateFollowUp={() => setFollowUpDialogOpen(true)}
            onEditReminder={(r) => { setSelectedReminder(r); setReminderDialogOpen(true); }}
            onEditFollowUp={(f) => { setSelectedFollowUp(f); setFollowUpDialogOpen(true); }}
            onCompleteReminder={(id) => actions.updateReminderStatusMutation.mutate({ id, status: 'completed' })}
            onCancelReminder={(id) => actions.updateReminderStatusMutation.mutate({ id, status: 'cancelled' })}
            onCompleteFollowUp={(id) => actions.updateFollowUpStatusMutation.mutate({ id, status: 'completed' })}
            onProgressFollowUp={(id) => actions.updateFollowUpStatusMutation.mutate({ id, status: 'in_progress' })}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <EnhancedSessionAnalytics stats={stats} />
        </TabsContent>
      </Tabs>

      <SessionSearch
        sessions={sessions}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectSession={handleSelectSession}
      />

      <SessionDrawer
        session={selectedSession}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onComplete={handleCompleteSession}
      />

      <NewSessionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sessionType={sessionType}
        onSessionTypeChange={setSessionType}
        students={students}
        topics={topics}
        selectedStudents={selectedStudents}
        onSelectedStudentsChange={setSelectedStudents}
        onSubmit={handleCreateSession}
        isPending={actions.createSessionMutation.isPending}
      />

      {selectedSession && (
        <EnhancedCompleteSessionDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          session={selectedSession}
          onSubmit={handleCompleteSubmit}
          isPending={actions.completeSessionMutation.isPending}
        />
      )}

      <ReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        students={students}
        initialData={selectedReminder ? {
          id: selectedReminder.id,
          sessionId: selectedReminder.sessionId,
          reminderType: selectedReminder.reminderType,
          reminderDate: new Date(selectedReminder.reminderDate),
          reminderTime: selectedReminder.reminderTime,
          title: selectedReminder.title,
          description: selectedReminder.description,
          studentIds: selectedReminder.studentIds ? JSON.parse(selectedReminder.studentIds) : [],
        } : undefined}
        onSubmit={(data) => {
          if (selectedReminder) {
            actions.updateReminderMutation.mutate({ id: selectedReminder.id, data });
          } else {
            actions.createReminderMutation.mutate(data);
          }
          setReminderDialogOpen(false);
          setSelectedReminder(null);
        }}
        isPending={selectedReminder 
          ? actions.updateReminderMutation.isPending 
          : actions.createReminderMutation.isPending
        }
      />

      <FollowUpDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        initialData={selectedFollowUp ? {
          id: selectedFollowUp.id,
          sessionId: selectedFollowUp.sessionId,
          followUpDate: new Date(selectedFollowUp.followUpDate),
          assignedTo: selectedFollowUp.assignedTo,
          priority: selectedFollowUp.priority,
          actionItems: selectedFollowUp.actionItems,
          notes: selectedFollowUp.notes,
        } : undefined}
        onSubmit={(data) => {
          if (selectedFollowUp) {
            actions.updateFollowUpMutation.mutate({ id: selectedFollowUp.id, data });
          } else {
            actions.createFollowUpMutation.mutate(data);
          }
          setFollowUpDialogOpen(false);
          setSelectedFollowUp(null);
        }}
        isPending={selectedFollowUp 
          ? actions.updateFollowUpMutation.isPending 
          : actions.createFollowUpMutation.isPending
        }
      />

      <SessionOutcomeDialog
        open={outcomeDialogOpen}
        onOpenChange={setOutcomeDialogOpen}
        session={selectedOutcome?.session || null}
        initialData={selectedOutcome ? {
          id: selectedOutcome.id,
          sessionId: selectedOutcome.sessionId,
          effectivenessRating: selectedOutcome.effectivenessRating,
          progressNotes: selectedOutcome.progressNotes,
          goalsAchieved: selectedOutcome.goalsAchieved,
          nextSteps: selectedOutcome.nextSteps,
          recommendations: selectedOutcome.recommendations,
          followUpRequired: selectedOutcome.followUpRequired,
          followUpDate: selectedOutcome.followUpDate ? new Date(selectedOutcome.followUpDate) : undefined,
        } : undefined}
        onSubmit={(data) => {
          if (selectedOutcome) {
            actions.updateOutcomeMutation.mutate({ id: selectedOutcome.id, data });
          } else {
            actions.createOutcomeMutation.mutate(data);
          }
          setOutcomeDialogOpen(false);
          setSelectedOutcome(null);
        }}
        isPending={selectedOutcome 
          ? actions.updateOutcomeMutation.isPending 
          : actions.createOutcomeMutation.isPending
        }
      />

      <ReportGenerationDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onGenerate={handleGenerateReport}
        sessionCount={sessions.length}
        outcomeCount={outcomes.length}
      />
    </div>
  );
}
