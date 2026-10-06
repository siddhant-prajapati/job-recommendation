import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CandidateSummary } from '../components/candidate/CandidateSummary';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { FilterBar } from '../components/job/FilterBar';
import { JobCard } from '../components/job/JobCard';
import { JobGridSkeleton } from '../components/job/JobCardSkeleton';
import { RecommendationStatsBar } from '../components/job/RecommendationStats';
import { PageHeader } from '../components/layout/PageHeader';
import { useCandidate } from '../hooks/useCandidate';
import { useLocations } from '../hooks/useLocations';
import { useRecommendations } from '../hooks/useRecommendations';
import { ApiError, getErrorMessage, getErrorTitle } from '../services/api/errors';
import { DEFAULT_FILTERS, type JobFilters } from '../types/recommendation';
import { filterRecommendations } from '../utils/filters';
import { uniqueSorted } from '../utils/formatting';
import { parseId } from '../utils/ids';
import { jobLocationName } from '../utils/location';
import { computeRecommendationStats } from '../utils/recommendations';

export function RecommendationsPage() {
  const { candidateId } = useParams();
  const id = parseId(candidateId);
  const candidateQuery = useCandidate(id);
  const recommendationsQuery = useRecommendations(id);
  const locationsQuery = useLocations();
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);

  const jobs = recommendationsQuery.data;
  const visibleJobs = useMemo(() => filterRecommendations(jobs ?? [], filters), [jobs, filters]);
  const stats = useMemo(() => computeRecommendationStats(jobs ?? []), [jobs]);
  const locations = useMemo(
    () =>
      uniqueSorted([
        ...(locationsQuery.data ?? []).map((location) => location.name),
        ...(jobs ?? []).map((job) => jobLocationName(job)),
      ]),
    [jobs, locationsQuery.data],
  );

  const candidate = candidateQuery.data;
  const isPending = candidateQuery.isPending || recommendationsQuery.isPending;
  const error = candidateQuery.error ?? recommendationsQuery.error;
  const isError = candidateQuery.isError || recommendationsQuery.isError;

  const retry = () => {
    void candidateQuery.refetch();
    void recommendationsQuery.refetch();
  };

  if (id == null) {
    return (
      <div className="page">
        <PageHeader title="Recommended jobs" backTo="/" backLabel="Back to dashboard" />
        <ErrorState title="Invalid request" message="This candidate id is not valid." />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        backTo={`/candidates/${id}`}
        backLabel="Back to profile"
        title={candidate ? `Recommended jobs for ${candidate.name.split(' ')[0]}` : 'Recommended jobs'}
        subtitle="Based on your skills, experience, location, and graph connections."
      />

      {candidate ? <CandidateSummary candidate={candidate} /> : null}

      {isPending ? <JobGridSkeleton count={4} /> : null}

      {isError ? (
        <ErrorState
          title={
            error instanceof ApiError && error.isNotFound
              ? 'Candidate not found'
              : getErrorTitle(error, 'Unable to load recommendations.')
          }
          message={getErrorMessage(error, 'Please try again.')}
          onRetry={retry}
        />
      ) : null}

      {!isPending && !isError && jobs?.length === 0 ? (
        <EmptyState
          title="No recommendations available yet"
          message="We couldn't find jobs matching your current skills and experience."
          action={
            <Link className="btn btn-primary" to="/jobs">
              Browse jobs
            </Link>
          }
        />
      ) : null}

      {!isPending && !isError && (jobs?.length ?? 0) > 0 ? (
        <>
          <RecommendationStatsBar stats={stats} visibleCount={visibleJobs.length} />
          <FilterBar filters={filters} locations={locations} onChange={setFilters} />
          {visibleJobs.length === 0 ? (
            <EmptyState
              title="No jobs found"
              message="Try clearing search or widening location, employment type, or match score."
              action={
                <button type="button" className="btn btn-secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset filters
                </button>
              }
            />
          ) : (
            <div className="jobs-grid">
              {candidate
                ? visibleJobs.map((job) => <JobCard key={job.jobId} job={job} candidate={candidate} />)
                : null}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
