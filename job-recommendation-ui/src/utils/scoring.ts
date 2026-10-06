import type { MatchTier } from '../types/recommendation';

export function getMatchTier(score: number): MatchTier {
  if (score >= 90) {
    return 'excellent';
  }
  if (score >= 75) {
    return 'strong';
  }
  if (score >= 60) {
    return 'good';
  }
  return 'partial';
}

export function getMatchLabel(score: number): string {
  switch (getMatchTier(score)) {
    case 'excellent':
      return 'Excellent Match';
    case 'strong':
      return 'Strong Match';
    case 'good':
      return 'Good Match';
    default:
      return 'Partial Match';
  }
}

export function isStrongMatch(score: number): boolean {
  return score >= 75;
}

export function isGoodMatch(score: number): boolean {
  return score >= 60 && score < 75;
}

export function roundScore(score: number): number {
  return Math.round(score);
}
