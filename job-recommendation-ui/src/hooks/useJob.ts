import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createJob, getJob, getJobs } from '../services/api/jobApi';
import type { JobCreateRequest } from '../types/job';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });
}

export function useJob(jobId: number | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId!),
    enabled: Number.isFinite(jobId),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JobCreateRequest) => createJob(payload),
    onSuccess: (job) => {
      queryClient.setQueryData(['job', job.id], job);
      void queryClient.invalidateQueries({ queryKey: ['jobs'] });
      void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
