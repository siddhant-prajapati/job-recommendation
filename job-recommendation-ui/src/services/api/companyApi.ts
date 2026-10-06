import type { Company } from '../../types/company';
import { mockGetCompanies } from '../mock/mockApi';
import { getWithFallback, request } from './client';

export async function getCompanies(): Promise<Company[]> {
  return getWithFallback(
    async () => [...(await request<Company[]>('/companies'))].sort((a, b) => a.name.localeCompare(b.name)),
    mockGetCompanies,
  );
}
