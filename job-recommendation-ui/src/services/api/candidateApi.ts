import { USE_MOCK } from '../../config';
import type { Candidate, CandidateCreateRequest } from '../../types/candidate';
import type { Skill } from '../../types/skill';
import {
  mockCreateCandidate,
  mockGetCandidate,
  mockGetCandidateSkills,
  mockGetCandidates,
} from '../mock/mockApi';
import { getWithFallback, request } from './client';

function normalizeCandidate(candidate: Candidate): Candidate {
  return {
    ...candidate,
    skills: candidate.skills ?? [],
    previousCompanies: candidate.previousCompanies ?? [],
  };
}

export async function getCandidates(): Promise<Candidate[]> {
  return getWithFallback(
    async () => (await request<Candidate[]>('/candidates')).map(normalizeCandidate),
    async () => (await mockGetCandidates()).map(normalizeCandidate),
  );
}

export async function getCandidate(candidateId: number): Promise<Candidate> {
  return getWithFallback(
    async () => normalizeCandidate(await request<Candidate>(`/candidates/${candidateId}`)),
    async () => normalizeCandidate(await mockGetCandidate(candidateId)),
  );
}

export async function getCandidateSkills(candidateId: number): Promise<Skill[]> {
  return getWithFallback(
    () => request<Skill[]>(`/candidates/${candidateId}/skills`),
    () => mockGetCandidateSkills(candidateId),
  );
}

export async function createCandidate(payload: CandidateCreateRequest): Promise<Candidate> {
  if (USE_MOCK) {
    return mockCreateCandidate(payload);
  }
  return normalizeCandidate(
    await request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}
