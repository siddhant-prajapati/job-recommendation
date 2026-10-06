import type { Company } from './company';
import type { Skill } from './skill';

export interface Candidate {
  id: number;
  name: string;
  experienceYears: number;
  location: string;
  skills: Skill[];
  previousCompanies: Company[];
}

export interface CandidateCreateRequest {
  name: string;
  experienceYears: number;
  location: string;
  skillIds: number[];
  companyIds: number[];
}
