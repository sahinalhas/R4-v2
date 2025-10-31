import { Router } from 'express';
import { randomUUID } from 'crypto';
import { StandardizedProfileRepository } from '../repository/standardized-profile.repository';
import { AggregateScoreCalculator } from '../services/aggregate-score-calculator.service';
import getDatabase from '../../../lib/database';

const router = Router();

router.get('/intervention-stats', (req, res) => {
  try {
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const studentsStmt = db.prepare('SELECT id FROM students');
    const students = studentsStmt.all() as Array<{ id: string }>;
    
    let totalOpen = 0;
    let completedThisMonth = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (const student of students) {
      const interventions = repo.getStandardizedInterventions(student.id);
      totalOpen += interventions.filter(i => 
        i.status !== "TAMAMLANDI" && i.status !== "İPTAL"
      ).length;
      
      const completed = interventions.filter(i => {
        if (i.status !== "TAMAMLANDI") return false;
        const intDate = new Date(i.startDate);
        return intDate.getMonth() === currentMonth && intDate.getFullYear() === currentYear;
      });
      completedThisMonth += completed.length;
    }
    
    res.json({
      openInterventions: totalOpen,
      completedThisMonth: completedThisMonth,
      totalStudents: students.length
    });
  } catch (error) {
    console.error('Error fetching intervention stats:', error);
    res.status(500).json({ error: 'Failed to fetch intervention stats' });
  }
});

router.get('/:studentId/academic', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getAcademicProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching academic profile:', error);
    res.status(500).json({ error: 'Failed to fetch academic profile' });
  }
});

router.post('/:studentId/academic', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertAcademicProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving academic profile:', error);
    res.status(500).json({ error: 'Failed to save academic profile' });
  }
});

router.get('/:studentId/social-emotional', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getSocialEmotionalProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching social-emotional profile:', error);
    res.status(500).json({ error: 'Failed to fetch social-emotional profile' });
  }
});

router.post('/:studentId/social-emotional', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertSocialEmotionalProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving social-emotional profile:', error);
    res.status(500).json({ error: 'Failed to save social-emotional profile' });
  }
});

router.get('/:studentId/talents-interests', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getTalentsInterestsProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching talents-interests profile:', error);
    res.status(500).json({ error: 'Failed to fetch talents-interests profile' });
  }
});

router.post('/:studentId/talents-interests', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertTalentsInterestsProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving talents-interests profile:', error);
    res.status(500).json({ error: 'Failed to save talents-interests profile' });
  }
});

router.get('/:studentId/health', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getStandardizedHealthProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching health profile:', error);
    res.status(500).json({ error: 'Failed to fetch health profile' });
  }
});

router.post('/:studentId/health', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertStandardizedHealthProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving health profile:', error);
    res.status(500).json({ error: 'Failed to save health profile' });
  }
});

router.get('/:studentId/interventions', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const interventions = repo.getStandardizedInterventions(studentId);
    
    res.json(interventions);
  } catch (error) {
    console.error('Error fetching interventions:', error);
    res.status(500).json({ error: 'Failed to fetch interventions' });
  }
});

router.post('/:studentId/interventions', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const intervention = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.insertStandardizedIntervention(intervention);
    res.json({ success: true, intervention });
  } catch (error) {
    console.error('Error saving intervention:', error);
    res.status(500).json({ error: 'Failed to save intervention' });
  }
});

router.get('/:studentId/behavior-incidents', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const incidents = repo.getStandardizedBehaviorIncidents(studentId);
    
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching behavior incidents:', error);
    res.status(500).json({ error: 'Failed to fetch behavior incidents' });
  }
});

router.post('/:studentId/behavior-incident', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const incident = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.insertStandardizedBehaviorIncident(incident);
    res.json({ success: true, incident });
  } catch (error) {
    console.error('Error saving behavior incident:', error);
    res.status(500).json({ error: 'Failed to save behavior incident' });
  }
});

router.get('/:studentId/aggregate', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const calculator = new AggregateScoreCalculator();
    
    const academic = repo.getAcademicProfile(studentId);
    const socialEmotional = repo.getSocialEmotionalProfile(studentId);
    const talentsInterests = repo.getTalentsInterestsProfile(studentId);
    const health = repo.getStandardizedHealthProfile(studentId);
    const behaviorIncidents = repo.getStandardizedBehaviorIncidents(studentId);
    const motivation = repo.getMotivationProfile(studentId);
    const riskProtective = repo.getRiskProtectiveProfile(studentId);
    const interventions = repo.getStandardizedInterventions(studentId);
    
    const aggregateScores = calculator.calculateAggregateScores({
      academic,
      socialEmotional,
      talentsInterests,
      health,
      behaviorIncidents,
      motivation,
      riskProtective
    });
    
    const aiReadyProfile = {
      studentId,
      profiles: {
        academic,
        socialEmotional,
        talentsInterests,
        health,
        behaviorIncidents,
        motivation,
        riskProtective,
        interventions
      },
      aggregateScores,
      metadata: {
        generatedAt: new Date().toISOString(),
        profileCompleteness: {
          academic: !!academic,
          socialEmotional: !!socialEmotional,
          talentsInterests: !!talentsInterests,
          health: !!health,
          behavior: behaviorIncidents.length > 0,
          motivation: !!motivation,
          riskProtective: !!riskProtective,
          interventions: interventions.length > 0
        }
      }
    };
    
    res.json(aiReadyProfile);
  } catch (error) {
    console.error('Error generating aggregate profile:', error);
    res.status(500).json({ error: 'Failed to generate aggregate profile' });
  }
});

router.get('/:studentId/motivation', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getMotivationProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching motivation profile:', error);
    res.status(500).json({ error: 'Failed to fetch motivation profile' });
  }
});

router.post('/:studentId/motivation', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    // Transform frontend field names to database field names
    const profile = {
      id: req.body.id || randomUUID(),
      studentId,
      assessmentDate: req.body.assessmentDate,
      primaryMotivationSources: req.body.primaryMotivators || [],
      careerAspirations: req.body.careerAspirations || [],
      universityPreferences: req.body.universityPreferences || [],
      academicGoals: req.body.academicGoals || [],
      goalClarityLevel: req.body.goalClarityLevel,
      intrinsicMotivation: req.body.intrinsicMotivationLevel,
      extrinsicMotivation: req.body.extrinsicMotivationLevel,
      persistenceLevel: req.body.persistenceLevel,
      futureOrientationLevel: req.body.futureOrientationLevel,
      shortTermGoals: req.body.shortTermGoals,
      longTermGoals: req.body.longTermGoals,
      obstacles: req.body.obstacles,
      supportNeeds: req.body.supportNeeds,
      additionalNotes: req.body.additionalNotes,
    };
    
    repo.upsertMotivationProfile(profile);
    res.json({ success: true, profile: req.body });
  } catch (error) {
    console.error('Error saving motivation profile:', error);
    res.status(500).json({ error: 'Failed to save motivation profile' });
  }
});

router.get('/:studentId/risk-protective', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getRiskProtectiveProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching risk/protective profile:', error);
    res.status(500).json({ error: 'Failed to fetch risk/protective profile' });
  }
});

router.post('/:studentId/risk-protective', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    // Transform frontend field names to backend field names
    const profile = {
      id: req.body.id || randomUUID(),
      studentId,
      assessmentDate: req.body.assessmentDate,
      // Risk levels
      academicRiskLevel: req.body.academicRiskLevel || null,
      behavioralRiskLevel: req.body.behavioralRiskLevel || null,
      socialEmotionalRiskLevel: req.body.emotionalRiskLevel || null,
      attendanceRiskLevel: req.body.attendanceRiskLevel || null,
      dropoutRisk: req.body.dropoutRisk || null,
      // Protective and risk factors
      activeProtectiveFactors: req.body.protectiveFactors || [],
      academicRiskFactors: req.body.riskAssessmentNotes || null,
      behavioralRiskFactors: req.body.behavioralRiskFactors || null,
      socialRiskFactors: req.body.socialRiskFactors || null,
      familyRiskFactors: req.body.familyRiskFactors || null,
      // Overall assessment
      overallRiskScore: req.body.overallRiskLevel || null,
      // Interventions and follow-up
      recommendedInterventions: req.body.recommendedInterventions || [],
      assignedCounselor: req.body.assignedCounselor || null,
      parentNotified: req.body.parentNotified || false,
      nextAssessmentDate: req.body.nextAssessmentDate || null,
      additionalNotes: req.body.additionalNotes || null,
      assessedBy: req.body.assessedBy || null,
    };
    
    repo.upsertRiskProtectiveProfile(profile);
    res.json({ success: true, profile: req.body });
  } catch (error) {
    console.error('Error saving risk protective profile:', error);
    res.status(500).json({ error: 'Failed to save risk protective profile' });
  }
});

export default router;
