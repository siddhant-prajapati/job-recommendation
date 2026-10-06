import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '../services/api/recommendationApi';

export function useRecommendations(candidateId: number | undefined) {
  return useQuery({
    queryKey: ['recommendations', candidateId],
    queryFn: () => getRecommendations(candidateId!),
    enabled: Number.isFinite(candidateId),
  });
}
