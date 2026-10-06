import { USE_MOCK } from '../../config';
import type { Candidate, CandidateCreateRequest } from '../../types/candidate';
import type { Company } from '../../types/company';
import type { Job, JobCreateRequest } from '../../types/job';
import type { JobRecommendation } from '../../types/recommendation';
import type { Skill } from '../../types/skill';
import { ApiError } from '../api/errors';
import type { Location } from '../../types/location';
import { delay, mockCandidates, mockCompanies, mockJobs, mockLocations, mockRecommendationsByCandidate, mockSkillCatalog } from './data';

function simulateLatency(ms = 550): Promise<void> {
  return delay(USE_MOCK ? ms : 0);
}

export async function mockGetCandidates(): Promise<Candidate[]> {
  await simulateLatency();
  return mockCandidates;
}

export async function mockGetCandidate(candidateId: number): Promise<Candidate> {
  await simulateLatency();
  const candidate = mockCandidates.find((item) => item.id === candidateId);
  if (!candidate) {
    throw new ApiError(404, `Candidate with id ${candidateId} not found`, 'Not Found');
  }
  return candidate;
}

export async function mockGetCandidateSkills(candidateId: number): Promise<Skill[]> {
  const candidate = await mockGetCandidate(candidateId);
  return candidate.skills;
}

export async function mockGetCompanies(): Promise<Company[]> {
  await simulateLatency();
  return [...mockCompanies].sort((a, b) => a.name.localeCompare(b.name));
}

export async function mockGetLocations(): Promise<Location[]> {
  await simulateLatency();
  return [...mockLocations].sort((a, b) => a.name.localeCompare(b.name));
}

export async function mockGetSkills(): Promise<Skill[]> {
  await simulateLatency();
  const byId = new Map<number, Skill>();
  for (const skill of [
    ...mockSkillCatalog,
    ...mockCandidates.flatMap((item) => item.skills),
    ...mockJobs.flatMap((item) => item.requiredSkills),
  ]) {
    byId.set(skill.id, skill);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function mockGetJobs(): Promise<Job[]> {
  await simulateLatency();
  return mockJobs;
}

export async function mockGetJob(jobId: number): Promise<Job> {
  await simulateLatency();
  const job = mockJobs.find((item) => item.id === jobId);
  if (!job) {
    throw new ApiError(404, `Job with id ${jobId} not found`, 'Not Found');
  }
  return job;
}

export async function mockGetRecommendations(candidateId: number): Promise<JobRecommendation[]> {
  await simulateLatency(700);
  await mockGetCandidate(candidateId);
  return mockRecommendationsByCandidate[String(candidateId)] ?? [];
}

export async function mockCreateCandidate(payload: CandidateCreateRequest): Promise<Candidate> {
  await simulateLatency();
  const nextId = mockCandidates.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const skillCatalog = [
    ...mockSkillCatalog,
    ...mockCandidates.flatMap((item) => item.skills),
    ...mockJobs.flatMap((item) => item.requiredSkills),
  ].filter((skill, index, all) => all.findIndex((entry) => entry.id === skill.id) === index);

  const skills = skillCatalog.filter((skill) => payload.skillIds.includes(skill.id));
  const previousCompanies = mockCompanies.filter((company) => payload.companyIds.includes(company.id));

  const candidate: Candidate = {
    id: nextId,
    name: payload.name,
    experienceYears: payload.experienceYears,
    location: payload.location,
    skills,
    previousCompanies,
  };
  mockCandidates.push(candidate);
  return candidate;
}

export async function mockCreateJob(payload: JobCreateRequest): Promise<Job> {
  await simulateLatency();
  const nextId = mockJobs.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const company = mockCompanies.find((item) => item.id === payload.companyId) ?? null;
  const skills = [
    ...mockSkillCatalog,
    ...mockJobs.flatMap((item) => item.requiredSkills),
    ...mockCandidates.flatMap((item) => item.skills),
  ]
    .filter((skill, index, all) => all.findIndex((entry) => entry.id === skill.id) === index)
    .filter((skill) => payload.skillIds.includes(skill.id));

  if (!company) {
    throw new ApiError(400, 'companyId is required', 'Bad Request');
  }
  if (skills.length === 0) {
    throw new ApiError(400, 'skillIds must not be empty', 'Bad Request');
  }

  const locatedIn = mockLocations.find((item) => item.name === payload.location) ?? {
    id: nextId + 1000,
    name: payload.location,
  };

  const job: Job = {
    id: nextId,
    title: payload.title,
    location: payload.location,
    minExperienceYears: payload.minExperienceYears,
    salary: payload.salary,
    employmentType: payload.employmentType,
    company,
    locatedIn,
    requiredSkills: skills,
  };
  mockJobs.push(job);
  return job;
}
