import * as repository from '../../repository/index.js';

export function getResponses(filters?: { distributionId?: string; studentId?: string }) {
  return repository.loadSurveyResponses(filters);
}

export function createResponse(response: any) {
  repository.saveSurveyResponse(response);
}

export function updateResponse(id: string, response: any) {
  repository.updateSurveyResponse(id, response);
}

export function deleteResponse(id: string) {
  repository.deleteSurveyResponse(id);
}
