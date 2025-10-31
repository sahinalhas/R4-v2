import { RequestHandler } from "express";
import * as progressService from '../services/progress.service.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../constants/errors.js";

export const getAllProgressHandler: RequestHandler = (req, res) => {
  try {
    const progress = progressService.getAllProgress();
    res.json(progress);
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_PROGRESS });
  }
};

export const getProgress: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = progressService.getProgressByStudent(studentId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_PROGRESS });
  }
};

export const saveProgressHandler: RequestHandler = (req, res) => {
  try {
    const progress = req.body;
    if (!Array.isArray(progress)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EXPECTED_ARRAY_OF_PROGRESS });
    }
    progressService.saveProgress(progress);
    res.json({ success: true, message: `${progress.length} ${SUCCESS_MESSAGES.PROGRESS_SAVED}` });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_PROGRESS });
  }
};

export const getAcademicGoals: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = progressService.getAcademicGoalsByStudent(studentId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching academic goals:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_ACADEMIC_GOALS });
  }
};

export const saveAcademicGoalsHandler: RequestHandler = (req, res) => {
  try {
    const goals = req.body;
    if (!Array.isArray(goals)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EXPECTED_ARRAY_OF_ACADEMIC_GOALS });
    }
    progressService.saveAcademicGoals(goals);
    res.json({ success: true, message: `${goals.length} ${SUCCESS_MESSAGES.ACADEMIC_GOALS_SAVED}` });
  } catch (error) {
    console.error('Error saving academic goals:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_ACADEMIC_GOALS });
  }
};
