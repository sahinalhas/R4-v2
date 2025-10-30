import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { SelfAssessmentsRepository } from '../repository/index.js';
import getDatabase from '../../../lib/database.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    institution?: string;
  };
}

let assessmentsRepo: SelfAssessmentsRepository | null = null;

function getRepository(): SelfAssessmentsRepository {
  if (!assessmentsRepo) {
    const db = getDatabase();
    assessmentsRepo = new SelfAssessmentsRepository(db);
  }
  return assessmentsRepo;
}

export function ensureStudentOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { assessmentId } = req.params;
    const userId = authReq.user.id;

    if (['COUNSELOR', 'ADMIN'].includes(authReq.user.role)) {
      return next();
    }

    if (!assessmentId) {
      return res.status(400).json({ error: 'Assessment ID is required' });
    }

    const repo = getRepository();
    const assessment = repo.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.studentId !== userId) {
      return res.status(403).json({ 
        error: 'Yetkisiz erişim',
        message: 'Bu anket size ait değil'
      });
    }

    next();
  } catch (error) {
    console.error('Error in ensureStudentOwnership middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function ensureCounselorRole(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['COUNSELOR', 'ADMIN'].includes(authReq.user.role)) {
      return res.status(403).json({ 
        error: 'Yetkisiz erişim',
        message: 'Bu işlem için rehber öğretmen yetkisi gereklidir'
      });
    }

    next();
  } catch (error) {
    console.error('Error in ensureCounselorRole middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const assessmentSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Rate limit exceeded',
    message: 'Çok fazla anket gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const assessmentStartLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: 'Rate limit exceeded',
    message: 'Çok fazla anket başlattınız. Lütfen birkaç dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const approvalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    error: 'Rate limit exceeded',
    message: 'Çok fazla onay işlemi yaptınız. Lütfen birkaç dakika bekleyin.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export function ensureStudentRole(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['STUDENT', 'COUNSELOR', 'ADMIN'].includes(authReq.user.role)) {
      return res.status(403).json({ 
        error: 'Yetkisiz erişim',
        message: 'Bu işlem öğrenciler için geçerlidir'
      });
    }

    next();
  } catch (error) {
    console.error('Error in ensureStudentRole middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function ensureAssessmentInDraftStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({ error: 'Assessment ID is required' });
    }

    const repo = getRepository();
    const assessment = repo.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'DRAFT') {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Bu anket zaten gönderilmiş veya tamamlanmış'
      });
    }

    next();
  } catch (error) {
    console.error('Error in ensureAssessmentInDraftStatus middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
