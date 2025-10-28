import * as repository from '../repository/counseling-sessions.repository.js';
import { sanitizeString } from '../../../middleware/validation.js';
import type { CounselingSession, CounselingSessionWithStudents, ClassHour, CounselingTopic, SessionFilters } from '../types/index.js';

function safeParseJSON(jsonString: string | null | undefined, fallback: any = []): any {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

export function getAllSessionsWithStudents(): CounselingSessionWithStudents[] {
  const sessions = repository.getAllSessions();
  
  return sessions.map((session) => {
    const parsedTags = safeParseJSON(session.sessionTags, []);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, student };
    }
  });
}

export function getActiveSessionsWithStudents(): CounselingSessionWithStudents[] {
  const sessions = repository.getActiveSessions();
  
  return sessions.map((session) => {
    const parsedTags = safeParseJSON(session.sessionTags, []);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, student };
    }
  });
}

export function getSessionByIdWithStudents(id: string): CounselingSessionWithStudents | null {
  const sanitizedId = sanitizeString(id);
  const session = repository.getSessionById(sanitizedId);
  
  if (!session) return null;
  
  const parsedTags = safeParseJSON(session.sessionTags, []);
  if (session.sessionType === 'group') {
    const students = repository.getStudentsBySessionId(sanitizedId);
    return { ...session, sessionTags: parsedTags, students };
  } else {
    const student = repository.getStudentBySessionId(sanitizedId);
    return { ...session, sessionTags: parsedTags, student };
  }
}

export function createCounselingSession(data: any): { success: boolean; id: string } {
  const session: CounselingSession = {
    id: data.id,
    sessionType: data.sessionType,
    groupName: data.groupName ? sanitizeString(data.groupName) : undefined,
    counselorId: sanitizeString(data.counselorId),
    sessionDate: data.sessionDate,
    entryTime: data.entryTime,
    entryClassHourId: data.entryClassHourId,
    topic: sanitizeString(data.topic),
    participantType: data.participantType || 'öğrenci',
    relationshipType: data.relationshipType ? sanitizeString(data.relationshipType) : undefined,
    otherParticipants: data.otherParticipants ? sanitizeString(data.otherParticipants) : undefined,
    parentName: data.parentName ? sanitizeString(data.parentName) : undefined,
    parentRelationship: data.parentRelationship ? sanitizeString(data.parentRelationship) : undefined,
    teacherName: data.teacherName ? sanitizeString(data.teacherName) : undefined,
    teacherBranch: data.teacherBranch ? sanitizeString(data.teacherBranch) : undefined,
    otherParticipantDescription: data.otherParticipantDescription ? sanitizeString(data.otherParticipantDescription) : undefined,
    sessionMode: data.sessionMode,
    sessionLocation: data.sessionLocation,
    disciplineStatus: data.disciplineStatus ? sanitizeString(data.disciplineStatus) : undefined,
    institutionalCooperation: data.institutionalCooperation ? sanitizeString(data.institutionalCooperation) : undefined,
    sessionDetails: data.sessionDetails ? sanitizeString(data.sessionDetails) : undefined,
    completed: 0
  };
  
  const sanitizedStudentIds = data.studentIds.map((id: string) => sanitizeString(id));
  
  repository.createSession(session, sanitizedStudentIds);
  return { success: true, id: session.id };
}

export function completeCounselingSession(
  id: string,
  completionData: {
    exitTime: string;
    exitClassHourId: number | null;
    detailedNotes: string | null;
    sessionFlow?: string;
    studentParticipationLevel?: string;
    cooperationLevel?: number;
    emotionalState?: string;
    physicalState?: string;
    communicationQuality?: string;
    sessionTags?: string[];
    achievedOutcomes?: string;
    followUpNeeded?: boolean;
    followUpPlan?: string;
    actionItems?: any[];
    autoCompleted?: boolean;
  }
): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const sanitizedNotes = completionData.detailedNotes ? sanitizeString(completionData.detailedNotes) : null;
  const sanitizedOutcomes = completionData.achievedOutcomes ? sanitizeString(completionData.achievedOutcomes) : null;
  const sanitizedFollowUpPlan = completionData.followUpPlan ? sanitizeString(completionData.followUpPlan) : null;
  
  const sessionTags = completionData.sessionTags ? JSON.stringify(completionData.sessionTags) : null;
  const actionItems = completionData.actionItems ? JSON.stringify(completionData.actionItems) : null;
  
  const result = repository.completeSession(
    sanitizedId,
    completionData.exitTime,
    completionData.exitClassHourId,
    sanitizedNotes,
    completionData.autoCompleted || false,
    completionData.sessionFlow,
    completionData.studentParticipationLevel,
    completionData.cooperationLevel,
    completionData.emotionalState,
    completionData.physicalState,
    completionData.communicationQuality,
    sessionTags,
    sanitizedOutcomes,
    completionData.followUpNeeded ? 1 : 0,
    sanitizedFollowUpPlan,
    actionItems
  );
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function extendCounselingSession(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.extendSession(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function autoCompleteSessions(): { success: boolean; completedCount: number } {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const sessionsToComplete = repository.getSessionsToAutoComplete();
  const completedCount = sessionsToComplete.length;
  
  if (completedCount > 0) {
    console.log(`⏰ Auto-completing ${completedCount} session(s) that exceeded time limit...`);
    for (const session of sessionsToComplete) {
      try {
        repository.autoCompleteSession(session.id, currentTime);
        console.log(`✅ Auto-completed session: ${session.id}`);
      } catch (error) {
        console.error(`❌ Failed to auto-complete session ${session.id}:`, error);
      }
    }
  }
  
  return { success: true, completedCount };
}

export function deleteCounselingSession(id: string): { success: boolean; notFound?: boolean } {
  const sanitizedId = sanitizeString(id);
  const result = repository.deleteSession(sanitizedId);
  
  if (result.changes === 0) {
    return { success: false, notFound: true };
  }
  
  return { success: true };
}

export function getClassHours(): ClassHour[] {
  const settingsRow = repository.getAppSettings();
  
  if (!settingsRow || !settingsRow.settings) {
    return [];
  }
  
  const settings = JSON.parse(settingsRow.settings);
  const periods = settings?.school?.periods || [];
  
  return periods.map((period: any, index: number) => ({
    id: index + 1,
    name: `${index + 1}. Ders`,
    startTime: period.start,
    endTime: period.end
  }));
}

export function getCounselingTopics(): CounselingTopic[] {
  const settingsRow = repository.getAppSettings();
  
  if (!settingsRow || !settingsRow.settings) {
    return [];
  }
  
  const settings = JSON.parse(settingsRow.settings);
  const presentationSystem = settings?.presentationSystem || [];
  
  const topics: CounselingTopic[] = [];
  
  function extractTopics(categories: any[], parentTitle = '') {
    for (const category of categories) {
      const fullTitle = parentTitle ? `${parentTitle} > ${category.title}` : category.title;
      
      if (category.items && category.items.length > 0) {
        for (const item of category.items) {
          topics.push({
            id: item.id,
            title: item.title,
            category: fullTitle,
            fullPath: `${fullTitle} > ${item.title}`
          });
        }
      }
      
      if (category.children && category.children.length > 0) {
        extractTopics(category.children, fullTitle);
      }
    }
  }
  
  for (const tab of presentationSystem) {
    if (tab.title?.toUpperCase().includes('BİREYSEL') && tab.categories && tab.categories.length > 0) {
      extractTopics(tab.categories, '');
    }
  }
  
  return topics;
}

export function getStudentSessionStats(studentId: string): any {
  const sanitizedStudentId = sanitizeString(studentId);
  return repository.getStudentSessionHistory(sanitizedStudentId);
}

export function getFilteredSessionsWithStudents(filters: any): CounselingSessionWithStudents[] {
  const sanitizedFilters: SessionFilters = {};
  
  if (filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim() !== '') {
    sanitizedFilters.startDate = sanitizeString(filters.startDate);
  }
  
  if (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim() !== '') {
    sanitizedFilters.endDate = sanitizeString(filters.endDate);
  }
  
  if (filters.topic && typeof filters.topic === 'string' && filters.topic.trim() !== '') {
    sanitizedFilters.topic = sanitizeString(filters.topic);
  }
  
  if (filters.className && typeof filters.className === 'string' && filters.className.trim() !== '') {
    sanitizedFilters.className = sanitizeString(filters.className);
  }
  
  if (filters.status && (filters.status === 'completed' || filters.status === 'active' || filters.status === 'all')) {
    sanitizedFilters.status = filters.status;
  }
  
  if (filters.participantType && typeof filters.participantType === 'string' && filters.participantType.trim() !== '') {
    sanitizedFilters.participantType = sanitizeString(filters.participantType);
  }
  
  if (filters.sessionType && (filters.sessionType === 'individual' || filters.sessionType === 'group' || filters.sessionType === 'all')) {
    sanitizedFilters.sessionType = filters.sessionType;
  }
  
  if (filters.sessionMode && typeof filters.sessionMode === 'string' && filters.sessionMode.trim() !== '') {
    sanitizedFilters.sessionMode = sanitizeString(filters.sessionMode);
  }
  
  if (filters.studentId && typeof filters.studentId === 'string' && filters.studentId.trim() !== '') {
    sanitizedFilters.studentId = sanitizeString(filters.studentId);
  }
  
  const sessions = repository.getFilteredSessions(sanitizedFilters);
  
  return sessions.map((session) => {
    const parsedTags = safeParseJSON(session.sessionTags, []);
    if (session.sessionType === 'group') {
      const students = repository.getStudentsBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, students };
    } else {
      const student = repository.getStudentBySessionId(session.id);
      return { ...session, sessionTags: parsedTags, student };
    }
  });
}
