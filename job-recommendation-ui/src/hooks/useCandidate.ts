import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCandidate, getCandidate, getCandidates, getCandidateSkills } from '../services/api/candidateApi';
import type { CandidateCreateRequest } from '../types/candidate';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates,
  });
}

export function useCandidate(candidateId: number | undefined) {
  return useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => getCandidate(candidateId!),
    enabled: Number.isFinite(candidateId),
  });
}

export function useCandidateSkills(candidateId: number | undefined) {
  return useQuery({
    queryKey: ['candidate-skills', candidateId],
    queryFn: () => getCandidateSkills(candidateId!),
    enabled: Number.isFinite(candidateId),
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CandidateCreateRequest) => createCandidate(payload),
    onSuccess: (candidate) => {
      queryClient.setQueryData(['candidate', candidate.id], candidate);
      queryClient.setQueryData(['candidate-skills', candidate.id], candidate.skills);
      void queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
