import { randomUUID } from 'crypto';
import * as repository from '../repository/early-warning.repository.js';
import * as studentRepo from '../../students/repository/students.repository.js';
import * as behaviorRepo from '../../behavior/repository/behavior.repository.js';
import * as attendanceRepo from '../../attendance/repository/attendance.repository.js';
import * as examsRepo from '../../exams/repository/exams.repository.js';
import * as counselingAnalyticsRepo from '../../counseling-sessions/repository/analytics.repository.js';
import { analyzeRiskFactors } from './risk-scoring.service.js';
import { generateAllAlerts } from './alert-generator.service.js';
import { generateAllInterventions } from './intervention-recommender.service.js';
import type { RiskFactorData, RiskAnalysisResult, RiskScoreHistory } from '../../../../shared/types/early-warning.types';

export async function analyzeStudentRisk(studentId: string): Promise<RiskAnalysisResult> {
  const academicRecords = studentRepo.getAcademicsByStudent(studentId);
  const behaviorStats = behaviorRepo.getBehaviorStatsByStudent(studentId);
  const attendanceRecords = attendanceRepo.getAttendanceByStudent(studentId);
  const examResults = examsRepo.getExamResultsByStudent(studentId);
  const counselingStats = counselingAnalyticsRepo.getStudentSessionStats(studentId);
  
  const riskData: RiskFactorData = {
    academicPerformance: {
      gpa: academicRecords.length > 0 ? academicRecords[0].gpa : undefined,
      recentExamScores: examResults.slice(0, 3).map(e => e.totalScore).filter(s => s !== undefined) as number[],
      failingSubjects: academicRecords.length > 0 && academicRecords[0].exams && typeof academicRecords[0].exams === 'string'
        ? JSON.parse(academicRecords[0].exams).filter((e: any) => e.grade && e.grade < 50).length 
        : 0,
      gradeDecline: academicRecords.length >= 2 
        ? (academicRecords[0].gpa || 0) < (academicRecords[1].gpa || 0) 
        : false
    },
    behaviorData: {
      totalIncidents: behaviorStats.overallStats?.totalIncidents || 0,
      seriousIncidents: behaviorStats.overallStats?.seriousCount || 0,
      positiveCount: behaviorStats.overallStats?.positiveCount || 0,
      recentIncidentCount: behaviorRepo.getBehaviorIncidentsByStudent(studentId).slice(0, 30).length
    },
    attendanceData: (() => {
      const totalDays = attendanceRecords.length;
      const absentDays = attendanceRecords.filter(a => a.status === 'Devamsız').length;
      const tardyDays = attendanceRecords.filter(a => a.status === 'Geç').length;
      const excusedAbsences = attendanceRecords.filter(a => a.status === 'Devamsız' && a.notes).length;
      
      return {
        totalDays,
        absentDays,
        tardyDays,
        excusedAbsences,
        attendanceRate: totalDays > 0 ? ((totalDays - absentDays) / totalDays) * 100 : 100
      };
    })(),
    socialEmotionalData: {
      counselingSessionCount: counselingStats.totalSessions || 0,
      recentConcerns: [],
      supportLevel: (counselingStats.totalSessions || 0) > 10 ? 'YÜKSEK' : (counselingStats.totalSessions || 0) > 5 ? 'ORTA' : 'DÜŞÜK'
    }
  };
  
  const analysis = analyzeRiskFactors(riskData);
  analysis.studentId = studentId;
  
  const alerts = generateAllAlerts(studentId, riskData, {
    academic: analysis.academicScore,
    behavioral: analysis.behavioralScore,
    attendance: analysis.attendanceScore,
    socialEmotional: analysis.socialEmotionalScore
  });
  
  const recommendations = generateAllInterventions(studentId, alerts);
  
  analysis.alerts = alerts;
  analysis.recommendations = recommendations;
  
  const scoreHistory: RiskScoreHistory = {
    id: randomUUID(),
    studentId,
    assessmentDate: new Date().toISOString(),
    academicScore: analysis.academicScore,
    behavioralScore: analysis.behavioralScore,
    attendanceScore: analysis.attendanceScore,
    socialEmotionalScore: analysis.socialEmotionalScore,
    overallRiskScore: analysis.overallRiskScore,
    riskLevel: analysis.riskLevel,
    dataPoints: JSON.stringify(riskData),
    calculationMethod: 'weighted_average'
  };
  
  repository.insertRiskScoreHistory(scoreHistory);
  
  for (const alert of alerts) {
    repository.insertAlert(alert);
  }
  
  for (const recommendation of recommendations) {
    repository.insertRecommendation(recommendation);
  }
  
  return analysis;
}

export function getRiskScoreHistory(studentId: string) {
  return repository.getRiskScoreHistory(studentId);
}

export function getLatestRiskScore(studentId: string) {
  return repository.getLatestRiskScore(studentId);
}

export function getAllAlerts() {
  return repository.getAllAlerts();
}

export function getAlertsByStudent(studentId: string) {
  return repository.getAlertsByStudent(studentId);
}

export function getActiveAlerts() {
  return repository.getActiveAlerts();
}

export function getAlertById(id: string) {
  return repository.getAlertById(id);
}

export function updateAlertStatus(id: string, status: string) {
  repository.updateAlertStatus(id, status);
  return { success: true };
}

export function updateAlert(id: string, updates: any) {
  repository.updateAlert(id, updates);
  return { success: true };
}

export function deleteAlert(id: string) {
  repository.deleteAlert(id);
  return { success: true };
}

export function getRecommendationsByStudent(studentId: string) {
  return repository.getRecommendationsByStudent(studentId);
}

export function getRecommendationsByAlert(alertId: string) {
  return repository.getRecommendationsByAlert(alertId);
}

export function getActiveRecommendations() {
  return repository.getActiveRecommendations();
}

export function updateRecommendationStatus(id: string, status: string) {
  repository.updateRecommendationStatus(id, status);
  return { success: true };
}

export function updateRecommendation(id: string, updates: any) {
  repository.updateRecommendation(id, updates);
  return { success: true };
}

export function deleteRecommendation(id: string) {
  repository.deleteRecommendation(id);
  return { success: true };
}

export function getHighRiskStudents() {
  return repository.getHighRiskStudents();
}

export function getAlertStatistics() {
  return repository.getAlertStatistics();
}

export function getDashboardSummary() {
  const activeAlerts = repository.getActiveAlerts();
  const highRiskStudents = repository.getHighRiskStudents();
  const activeRecommendations = repository.getActiveRecommendations();
  const alertStats = repository.getAlertStatistics();
  
  return {
    totalActiveAlerts: activeAlerts.length,
    highRiskStudentCount: highRiskStudents.length,
    pendingRecommendations: activeRecommendations.filter(r => r.status === 'ÖNERİLDİ').length,
    criticalAlerts: activeAlerts.filter(a => a.alertLevel === 'KRİTİK').length,
    alertsByLevel: alertStats,
    recentAlerts: activeAlerts.slice(0, 5),
    topRiskStudents: highRiskStudents.slice(0, 10)
  };
}
