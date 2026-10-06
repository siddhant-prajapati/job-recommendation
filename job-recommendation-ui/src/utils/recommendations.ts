import type { JobRecommendation } from '../types/recommendation';
import { isGoodMatch, isStrongMatch } from './scoring';

export interface RecommendationStats {
  total: number;
  strongMatches: number;
  goodMatches: number;
  remoteJobs: number;
  skillMatches: number;
}

export function computeRecommendationStats(items: JobRecommendation[]): RecommendationStats {
  return {
    total: items.length,
    strongMatches: items.filter((job) => isStrongMatch(job.matchScore)).length,
    goodMatches: items.filter((job) => isGoodMatch(job.matchScore)).length,
    remoteJobs: items.filter((job) => (job.location ?? '').toLowerCase() === 'remote').length,
    skillMatches: items.filter((job) => job.matchedSkillCount > 0).length,
  };
}

export function hasCompanyConnection(reasons: string[]): boolean {
  return reasons.some((reason) => /former employer|colleague/i.test(reason));
}

export function isExperienceMatched(candidateYears: number, minYears: number): boolean {
  return candidateYears >= minYears;
}

export function isLocationMatched(candidateLocation: string, jobLocation: string): boolean {
  const candidate = candidateLocation.trim().toLowerCase();
  const job = jobLocation.trim().toLowerCase();
  return candidate === job || candidate === 'remote' || job === 'remote';
}
