export interface JobRecommendation {
  jobId: number;
  title: string;
  company: string | null;
  location: string;
  minExperienceYears: number;
  salary: number | null;
  employmentType: string;
  matchedSkills: string[];
  requiredSkills: string[];
  matchedSkillCount: number;
  matchScore: number;
  reasons: string[];
}

export type MatchTier = 'excellent' | 'strong' | 'good' | 'partial';

export type SortOption = 'match' | 'salary-desc' | 'salary-asc' | 'experience';

export interface JobFilters {
  search: string;
  location: string;
  employmentType: string;
  minMatch: number | null;
  sort: SortOption;
}

export const DEFAULT_FILTERS: JobFilters = {
  search: '',
  location: 'All',
  employmentType: 'All',
  minMatch: null,
  sort: 'match',
};
