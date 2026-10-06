export function jobLocationName(job: {
  location?: string | null;
  locatedIn?: { name: string } | null;
}): string {
  return job.locatedIn?.name || job.location || '';
}
