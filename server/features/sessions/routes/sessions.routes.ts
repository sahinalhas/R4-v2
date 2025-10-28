import { RequestHandler } from 'express';
import * as sessionsService from '../services/sessions.service.js';

export const getStudySessions: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const sessions = sessionsService.getStudentSessions(studentId);
    res.json(sessions);
  } catch (error) {
    console.error('Error getting study sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get study sessions';
    
    if (errorMessage.includes('required')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to get study sessions' });
  }
};

export const saveStudySession: RequestHandler = (req, res) => {
  try {
    const result = sessionsService.createStudySession(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error saving study session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save study session';
    
    if (errorMessage.includes('required') || errorMessage.includes('Geçersiz')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to save study session' });
  }
};
