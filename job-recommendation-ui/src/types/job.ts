import type { Company } from './company';
import type { Location } from './location';
import type { Skill } from './skill';

export interface Job {
  id: number;
  title: string;
  location: string;
  minExperienceYears: number;
  salary: number | null;
  employmentType: string;
  company: Company | null;
  locatedIn: Location | null;
  requiredSkills: Skill[];
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface JobCreateRequest {
  title: string;
  location: string;
  minExperienceYears: number;
  salary: number | null;
  employmentType: string;
  companyId: number;
  skillIds: number[];
}

export const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];
