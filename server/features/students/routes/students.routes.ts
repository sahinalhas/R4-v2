import { RequestHandler } from "express";
import * as studentsService from '../services/students.service.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../constants/errors.js";
import { sanitizeString } from "../../../middleware/validation.js";

export const getStudents: RequestHandler = (req, res) => {
  try {
    const students = studentsService.getAllStudents();
    const mappedStudents = students.map((s: any) => ({
      ...s,
      ad: s.name,
      soyad: s.surname,
      class: s.class,
      cinsiyet: s.gender,
    }));
    res.json(mappedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: ERROR_MESSAGES.FAILED_TO_FETCH_STUDENTS });
  }
};

export const saveStudentHandler: RequestHandler = (req, res) => {
  try {
    const student = req.body;
    
    const mappedStudent = {
      ...student,
      name: student.ad || student.name,
      surname: student.soyad || student.surname,
      class: student.class,
      gender: student.cinsiyet || student.gender,
    };
    
    studentsService.createOrUpdateStudent(mappedStudent);
    res.json({ success: true, message: SUCCESS_MESSAGES.STUDENT_SAVED });
  } catch (error) {
    console.error('Error saving student:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("zorunludur")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `${ERROR_MESSAGES.FAILED_TO_SAVE_STUDENT}: ${errorMessage}` 
    });
  }
};

export const saveStudentsHandler: RequestHandler = (req, res) => {
  try {
    const students = req.body;
    
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: ERROR_MESSAGES.EXPECTED_ARRAY_OF_STUDENTS });
    }
    
    const mappedStudents = students.map(student => ({
      ...student,
      name: student.ad || student.name,
      surname: student.soyad || student.surname,
      class: student.class,
      gender: student.cinsiyet || student.gender,
    }));
    
    studentsService.bulkSaveStudents(mappedStudents);
    res.json({ success: true, message: `${students.length} ${SUCCESS_MESSAGES.STUDENTS_SAVED}` });
  } catch (error) {
    console.error('Error saving students:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_STUDENTS });
  }
};

export const getStudentAcademics: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    const sanitizedId = sanitizeString(id);
    const academics = studentsService.getStudentAcademics(sanitizedId);
    res.json(academics);
  } catch (error) {
    console.error('Error fetching student academics:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_ACADEMICS });
  }
};

export const addStudentAcademic: RequestHandler = (req, res) => {
  try {
    const academic = req.body;
    
    const sanitizedAcademic = {
      ...academic,
      studentId: academic.studentId ? sanitizeString(academic.studentId) : academic.studentId,
      semester: academic.semester ? sanitizeString(academic.semester) : academic.semester,
      notes: academic.notes ? sanitizeString(academic.notes) : undefined
    };
    
    studentsService.createAcademic(sanitizedAcademic);
    res.json({ success: true, message: "Akademik kayıt eklendi" });
  } catch (error) {
    console.error('Error adding academic record:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("zorunludur")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: "Akademik kayıt eklenirken hata oluştu" });
  }
};

export const getStudentProgress: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    const sanitizedId = sanitizeString(id);
    const progress = studentsService.getStudentProgress(sanitizedId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_STUDENT_PROGRESS });
  }
};

export const deleteStudentHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationName } = req.body;
    
    const result = studentsService.removeStudent(id, confirmationName);
    
    res.json({ 
      success: true, 
      message: `${result.studentName} başarıyla silindi` 
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("bulunamadı")) {
      return res.status(404).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    if (errorMessage.includes("onaylamak")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Öğrenci silinirken hata oluştu" 
    });
  }
};
