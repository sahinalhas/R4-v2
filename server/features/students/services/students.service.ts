import * as repository from '../repository/students.repository.js';
import type { Student, AcademicRecord, Progress } from '../types/students.types.js';

export function normalizeStudentData(student: any): Student {
  const normalized: any = {
    id: student.id ? String(student.id).trim() : '',
    name: student.name ? String(student.name).trim() : '',
    surname: student.surname ? String(student.surname).trim() : '',
    email: student.email ? String(student.email).trim() : undefined,
    phone: student.phone ? String(student.phone).trim() : undefined,
    birthDate: student.birthDate || undefined,
    address: student.address ? String(student.address).trim() : undefined,
    class: student.class ? String(student.class).trim() : undefined,
    enrollmentDate: student.enrollmentDate || new Date().toISOString().split('T')[0],
    status: student.status || 'active',
    avatar: student.avatar || undefined,
    parentContact: student.parentContact ? String(student.parentContact).trim() : undefined,
    notes: student.notes ? String(student.notes).trim() : undefined,
    gender: student.gender || 'K',
    risk: student.risk || 'Düşük',
  };
  
  return normalized as Student;
}

export function validateStudent(student: any): { valid: boolean; error?: string } {
  if (!student || typeof student !== 'object') {
    return { valid: false, error: "Geçersiz öğrenci verisi" };
  }
  
  if (!student.id || typeof student.id !== 'string' || student.id.trim().length === 0) {
    return { valid: false, error: "Öğrenci ID zorunludur" };
  }
  
  if (!student.name || typeof student.name !== 'string' || student.name.trim().length === 0) {
    return { valid: false, error: "Öğrenci adı zorunludur" };
  }
  
  if (!student.surname || typeof student.surname !== 'string' || student.surname.trim().length === 0) {
    return { valid: false, error: "Öğrenci soyadı zorunludur" };
  }
  
  return { valid: true };
}

export function validateAcademic(academic: any): { valid: boolean; error?: string } {
  if (!academic || typeof academic !== 'object') {
    return { valid: false, error: "Geçersiz akademik kayıt verisi" };
  }
  
  if (!academic.studentId || !academic.semester || academic.year === undefined) {
    return { valid: false, error: "studentId, semester ve year alanları zorunludur" };
  }
  
  return { valid: true };
}

export function getAllStudents(): Student[] {
  return repository.loadStudents();
}

export function createOrUpdateStudent(student: any): void {
  const validation = validateStudent(student);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const normalizedStudent = normalizeStudentData(student);
  repository.saveStudent(normalizedStudent);
}

export function bulkSaveStudents(students: any[]): void {
  if (!Array.isArray(students)) {
    throw new Error('Expected array of students');
  }
  
  const invalidIndices: number[] = [];
  for (let i = 0; i < students.length; i++) {
    const validation = validateStudent(students[i]);
    if (!validation.valid) {
      invalidIndices.push(i);
    }
  }
  
  if (invalidIndices.length > 0) {
    throw new Error(`Geçersiz öğrenci verileri (indeksler: ${invalidIndices.join(', ')})`);
  }
  
  const normalizedStudents = students.map(student => normalizeStudentData(student));
  repository.saveStudents(normalizedStudents);
}

export function removeStudent(id: string, confirmationName?: string): { studentName: string } {
  const students = repository.loadStudents();
  const student = students.find(s => s.id === id);
  
  if (!student) {
    throw new Error("Öğrenci bulunamadı");
  }
  
  if (confirmationName) {
    const expectedName = `${student.name} ${student.surname}`.trim();
    const sanitizedConfirmationName = (confirmationName || '').trim();
    
    if (sanitizedConfirmationName !== expectedName) {
      throw new Error("Silme işlemini onaylamak için öğrencinin tam adını doğru yazmalısınız");
    }
  }
  
  repository.deleteStudent(id);
  return { studentName: `${student.name} ${student.surname}` };
}

export function getStudentAcademics(studentId: string): AcademicRecord[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getAcademicsByStudent(studentId);
}

export function createAcademic(academic: any): void {
  const validation = validateAcademic(academic);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const sanitizedAcademic = {
    studentId: academic.studentId,
    semester: academic.semester,
    gpa: academic.gpa !== undefined && academic.gpa !== null ? Number(academic.gpa) : undefined,
    year: Number(academic.year),
    exams: academic.exams || [],
    notes: academic.notes || undefined
  };
  
  repository.addAcademic(sanitizedAcademic);
}

export function getStudentProgress(studentId: string): Progress[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  repository.ensureProgressForStudent(studentId);
  return repository.getProgressByStudent(studentId);
}
