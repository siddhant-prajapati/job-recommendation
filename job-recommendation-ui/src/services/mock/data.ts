import type { Candidate } from '../../types/candidate';
import type { Company } from '../../types/company';
import type { Job } from '../../types/job';
import type { Location } from '../../types/location';
import type { JobRecommendation } from '../../types/recommendation';
import type { Skill } from '../../types/skill';
import candidatesJson from '../fixtures/candidates.json' with { type: 'json' };
import companiesJson from '../fixtures/companies.json' with { type: 'json' };
import jobsJson from '../fixtures/jobs.json' with { type: 'json' };
import locationsJson from '../fixtures/locations.json' with { type: 'json' };
import recommendationsJson from '../fixtures/recommendations.json' with { type: 'json' };
import skillsJson from '../fixtures/skills.json' with { type: 'json' };

export const mockCandidates = structuredClone(candidatesJson) as Candidate[];
export const mockCompanies = structuredClone(companiesJson) as Company[];
export const mockJobs = structuredClone(jobsJson) as Job[];
export const mockLocations = structuredClone(locationsJson) as Location[];
export const mockSkillCatalog = structuredClone(skillsJson) as Skill[];
export const mockRecommendationsByCandidate = structuredClone(recommendationsJson) as Record<
  string,
  JobRecommendation[]
>;

export function delay(ms = 550): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
