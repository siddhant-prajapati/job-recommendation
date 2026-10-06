import type { Location } from '../../types/location';
import { mockGetLocations } from '../mock/mockApi';
import { getWithFallback, request } from './client';

export async function getLocations(): Promise<Location[]> {
  return getWithFallback(
    async () => [...(await request<Location[]>('/locations'))].sort((a, b) => a.name.localeCompare(b.name)),
    mockGetLocations,
  );
}
