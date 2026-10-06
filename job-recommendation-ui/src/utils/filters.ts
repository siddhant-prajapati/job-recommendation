import type { Job } from '../types/job';
import type { JobFilters, JobRecommendation } from '../types/recommendation';
import { jobLocationName } from './location';

function matchesSearch(haystack: string[], query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return haystack.some((value) => value.toLowerCase().includes(q));
}

export function filterRecommendations(
  items: JobRecommendation[],
  filters: JobFilters,
): JobRecommendation[] {
  const filtered = items.filter((job) => {
    if (filters.location !== 'All' && job.location !== filters.location) {
      return false;
    }
    if (filters.employmentType !== 'All' && job.employmentType !== filters.employmentType) {
      return false;
    }
    if (filters.minMatch != null && job.matchScore < filters.minMatch) {
      return false;
    }
    return matchesSearch(
      [job.title, job.company ?? '', job.location ?? '', ...job.matchedSkills, ...job.requiredSkills],
      filters.search,
    );
  });

  return sortRecommendations(filtered, filters.sort);
}

export function sortRecommendations(
  items: JobRecommendation[],
  sort: JobFilters['sort'],
): JobRecommendation[] {
  const copy = [...items];
  switch (sort) {
    case 'salary-desc':
      return copy.sort((a, b) => (b.salary ?? -1) - (a.salary ?? -1));
    case 'salary-asc':
      return copy.sort((a, b) => (a.salary ?? Number.MAX_SAFE_INTEGER) - (b.salary ?? Number.MAX_SAFE_INTEGER));
    case 'experience':
      return copy.sort((a, b) => (a.minExperienceYears ?? 0) - (b.minExperienceYears ?? 0));
    case 'match':
    default:
      return copy.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export function filterJobs(items: Job[], filters: Omit<JobFilters, 'minMatch' | 'sort'> & { sort?: JobFilters['sort'] }): Job[] {
  const filtered = items.filter((job) => {
    if (filters.location !== 'All' && jobLocationName(job) !== filters.location) {
      return false;
    }
    if (filters.employmentType !== 'All' && job.employmentType !== filters.employmentType) {
      return false;
    }
    return matchesSearch(
      [
        job.title,
        job.company?.name ?? '',
        jobLocationName(job),
        ...job.requiredSkills.map((skill) => skill.name),
      ],
      filters.search,
    );
  });

  const copy = [...filtered];
  switch (filters.sort) {
    case 'salary-desc':
      return copy.sort((a, b) => (b.salary ?? -1) - (a.salary ?? -1));
    case 'salary-asc':
      return copy.sort((a, b) => (a.salary ?? Number.MAX_SAFE_INTEGER) - (b.salary ?? Number.MAX_SAFE_INTEGER));
    case 'experience':
      return copy.sort((a, b) => a.minExperienceYears - b.minExperienceYears);
    default:
      return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
}
