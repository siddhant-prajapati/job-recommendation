import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../services/api/companyApi';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });
}
