import type { Skill } from '../../types/skill';
import { mockGetSkills } from '../mock/mockApi';
import { getWithFallback, request } from './client';

export async function getSkills(): Promise<Skill[]> {
  return getWithFallback(
    async () => [...(await request<Skill[]>('/skills'))].sort((a, b) => a.name.localeCompare(b.name)),
    mockGetSkills,
  );
}
