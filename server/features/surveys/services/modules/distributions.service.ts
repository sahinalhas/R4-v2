import * as repository from '../../repository/index.js';
import { sanitizeString } from '../../../../middleware/validation.js';

export function getAllDistributions() {
  return repository.loadSurveyDistributions();
}

export function getDistributionById(id: string) {
  return repository.getSurveyDistribution(id);
}

export function getDistributionByPublicLink(publicLink: string) {
  return repository.getSurveyDistributionByLink(publicLink);
}

export function createDistribution(distribution: any) {
  const sanitizedDistribution = {
    ...distribution,
    title: sanitizeString(distribution.title),
    description: distribution.description ? sanitizeString(distribution.description) : undefined
  };
  
  repository.saveSurveyDistribution(sanitizedDistribution);
}

export function updateDistribution(id: string, distribution: any) {
  const sanitizedDistribution = {
    ...distribution,
    title: distribution.title ? sanitizeString(distribution.title) : undefined,
    description: distribution.description ? sanitizeString(distribution.description) : undefined
  };
  
  repository.updateSurveyDistribution(id, sanitizedDistribution);
}

export function deleteDistribution(id: string) {
  repository.deleteSurveyDistribution(id);
}
