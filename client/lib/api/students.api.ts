import type { Student, BackendStudent } from "../types/student.types";
import { backendToFrontend, frontendToBackend } from "../types/student.types";
import { apiClient } from "./api-client";
import { API_ERROR_MESSAGES } from "../constants/messages.constants";
import { handleApiError } from "../utils/error-utils";

let studentsCache: Student[] | null = null;

async function fetchStudentsFromAPI(): Promise<BackendStudent[]> {
  try {
    const response = await apiClient.get<BackendStudent[]>('/api/students', { showErrorToast: false });
    // Backend'den gelen veri zaten array formatında
    return Array.isArray(response) ? response : [];
  } catch (error) {
    handleApiError(error, {
      title: API_ERROR_MESSAGES.STUDENT.LOAD_ERROR,
      description: API_ERROR_MESSAGES.STUDENT.LOAD_ERROR_DESCRIPTION,
      context: 'fetchStudentsFromAPI',
      showToast: true
    });
    throw error;
  }
}

async function saveStudentsToAPI(students: BackendStudent[]): Promise<void> {
  return apiClient.post('/api/students/bulk', students, { showErrorToast: false });
}

export function loadStudents(): Student[] {
  if (studentsCache !== null) {
    return structuredClone(studentsCache);
  }
  
  loadStudentsAsync();
  
  studentsCache = [];
  return [];
}

export async function loadStudentsAsync(): Promise<void> {
  try {
    const backendStudents = await fetchStudentsFromAPI();
    const frontendStudents = backendStudents.map(backendToFrontend);
    studentsCache = frontendStudents;
    
    window.dispatchEvent(new CustomEvent('studentsUpdated'));
  } catch (error) {
    if (!studentsCache) {
      studentsCache = [];
    }
    window.dispatchEvent(new CustomEvent('studentsLoadFailed'));
    throw error;
  }
}

export async function saveStudents(list: Student[]): Promise<void> {
  const previousCache = studentsCache ? structuredClone(studentsCache) : null;
  
  try {
    const backendStudents = list.map(frontendToBackend);
    await saveStudentsToAPI(backendStudents);
    
    studentsCache = structuredClone(list);
    window.dispatchEvent(new CustomEvent('studentsUpdated'));
  } catch (error) {
    studentsCache = previousCache;
    
    handleApiError(error, {
      title: API_ERROR_MESSAGES.STUDENT.SAVE_ERROR,
      description: API_ERROR_MESSAGES.STUDENT.SAVE_ERROR_DESCRIPTION,
      context: 'saveStudents',
      showToast: true
    });
    
    throw error;
  }
}

export async function upsertStudent(stu: Student): Promise<void> {
  const previousCache = studentsCache ? structuredClone(studentsCache) : null;
  
  try {
    const backendStudent = frontendToBackend(stu);
    
    await apiClient.post('/api/students', backendStudent, { showErrorToast: false });
    
    const list = studentsCache ? [...studentsCache] : [];
    const idx = list.findIndex((s) => s.id === stu.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...stu };
    } else {
      list.unshift(stu);
    }
    studentsCache = structuredClone(list);
    
    window.dispatchEvent(new CustomEvent('studentsUpdated'));
    
  } catch (error) {
    studentsCache = previousCache;
    
    handleApiError(error, {
      title: API_ERROR_MESSAGES.STUDENT.SAVE_ERROR,
      description: API_ERROR_MESSAGES.STUDENT.SAVE_ERROR_DESCRIPTION,
      context: 'upsertStudent',
      showToast: true
    });
    throw error;
  }
}

export async function refreshStudentsFromAPI(): Promise<Student[]> {
  const backendStudents = await fetchStudentsFromAPI();
  const frontendStudents = backendStudents.map(backendToFrontend);
  studentsCache = frontendStudents;
  
  return frontendStudents;
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/students/${id}`, {
      showSuccessToast: true,
      successMessage: API_ERROR_MESSAGES.STUDENT.DELETE_SUCCESS,
      showErrorToast: false,
    });
    
    if (studentsCache) {
      studentsCache = studentsCache.filter(s => s.id !== id);
      window.dispatchEvent(new CustomEvent('studentsUpdated'));
    }
  } catch (error) {
    handleApiError(error, {
      title: API_ERROR_MESSAGES.STUDENT.DELETE_ERROR,
      description: API_ERROR_MESSAGES.GENERIC.DELETE_ERROR_DESCRIPTION,
      context: 'deleteStudent'
    });
    throw error;
  }
}
