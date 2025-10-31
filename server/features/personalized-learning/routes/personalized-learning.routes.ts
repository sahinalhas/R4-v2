import { Router } from 'express';
import { PersonalizedLearningService } from '../../../services/personalized-learning.service';

const router = Router();
const learningService = new PersonalizedLearningService();

router.get('/learning-style/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const profile = await learningService.analyzeLearningStyle(studentId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Learning style analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Öğrenme stili analizi yapılamadı'
    });
  }
});

router.get('/academic-strengths/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const analysis = await learningService.analyzeAcademicStrengths(studentId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Academic strengths analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Akademik analiz yapılamadı'
    });
  }
});

router.get('/study-plan/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const plan = await learningService.generatePersonalizedStudyPlan(studentId);
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Çalışma planı oluşturulamadı'
    });
  }
});

export default router;
