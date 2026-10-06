import type { Company } from '../types/company';
import type { JobRecommendation } from '../types/recommendation';
import type { Skill } from '../types/skill';

export function relatedSkillsFromRecommendations(
  candidateSkills: Skill[],
  recommendations: JobRecommendation[],
): string[] {
  const known = new Set(candidateSkills.map((skill) => skill.name.toLowerCase()));
  const related = new Set<string>();

  for (const recommendation of recommendations) {
    for (const skill of recommendation.requiredSkills) {
      if (!known.has(skill.toLowerCase())) {
        related.add(skill);
      }
    }
  }

  return [...related].sort((a, b) => a.localeCompare(b));
}

export function relatedCompaniesFromRecommendations(
  previousCompanies: Company[],
  recommendations: JobRecommendation[],
): string[] {
  const known = new Set(previousCompanies.map((company) => company.name.toLowerCase()));
  const related = new Set<string>();

  for (const recommendation of recommendations) {
    if (recommendation.company && !known.has(recommendation.company.toLowerCase())) {
      related.add(recommendation.company);
    }
  }

  return [...related].sort((a, b) => a.localeCompare(b));
}
