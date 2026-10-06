import { USE_MOCK } from '../../config';
import type { Job, JobCreateRequest } from '../../types/job';
import { mockCreateJob, mockGetJob, mockGetJobs } from '../mock/mockApi';
import { getWithFallback, request } from './client';

function normalizeJob(job: Job): Job {
  const locatedIn = job.locatedIn ?? null;
  return {
    ...job,
    location: locatedIn?.name || job.location || '',
    salary: job.salary ?? null,
    company: job.company ?? null,
    locatedIn,
    requiredSkills: job.requiredSkills ?? [],
  };
}

export async function getJobs(): Promise<Job[]> {
  return getWithFallback(
    async () => (await request<Job[]>('/jobs')).map(normalizeJob),
    async () => (await mockGetJobs()).map(normalizeJob),
  );
}

export async function getJob(jobId: number): Promise<Job> {
  return getWithFallback(
    async () => normalizeJob(await request<Job>(`/jobs/${jobId}`)),
    async () => normalizeJob(await mockGetJob(jobId)),
  );
}

export async function createJob(payload: JobCreateRequest): Promise<Job> {
  if (USE_MOCK) {
    return mockCreateJob(payload);
  }
  return normalizeJob(
    await request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}
