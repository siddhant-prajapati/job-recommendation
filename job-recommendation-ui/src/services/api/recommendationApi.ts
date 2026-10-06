import type { JobRecommendation } from '../../types/recommendation';
import { mockGetRecommendations } from '../mock/mockApi';
import { getWithFallback, request } from './client';

function normalizeRecommendation(item: JobRecommendation): JobRecommendation {
  const matchedSkills = item.matchedSkills ?? [];
  const requiredSkills = item.requiredSkills ?? [];

  return {
    jobId: item.jobId,
    title: item.title,
    company: item.company ?? null,
    location: item.location ?? '',
    minExperienceYears: item.minExperienceYears ?? 0,
    salary: item.salary ?? null,
    employmentType: item.employmentType ?? '',
    matchedSkills,
    requiredSkills,
    matchedSkillCount: item.matchedSkillCount ?? matchedSkills.length,
    matchScore: item.matchScore ?? 0,
    reasons: item.reasons ?? [],
  };
}

export async function getRecommendations(candidateId: number): Promise<JobRecommendation[]> {
  return getWithFallback(
    async () =>
      (await request<JobRecommendation[]>(`/candidates/${candidateId}/recommendations`)).map(
        normalizeRecommendation,
      ),
    async () => (await mockGetRecommendations(candidateId)).map(normalizeRecommendation),
  );
}
