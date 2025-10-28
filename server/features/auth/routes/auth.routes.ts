import { Request, Response } from 'express';
import * as service from '../services/auth.service.js';

export function getSession(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const session = service.getSession(userId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
}

export function saveSession(req: Request, res: Response) {
  try {
    const { userId, userData, demoNoticeSeen } = req.body;

    if (!userId || !userData) {
      return res.status(400).json({ 
        error: 'userId and userData are required' 
      });
    }

    const result = service.saveSession({ userId, userData, demoNoticeSeen });
    res.json(result);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
}

export function updateSessionActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = service.updateSessionActivity(userId);
    res.json(result);
  } catch (error) {
    console.error('Error updating session activity:', error);
    res.status(500).json({ error: 'Failed to update session activity' });
  }
}

export function deleteSession(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = service.deleteSession(userId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}
