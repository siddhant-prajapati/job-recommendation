import { useQuery } from '@tanstack/react-query';
import { getLocations } from '../services/api/locationApi';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
  });
}
