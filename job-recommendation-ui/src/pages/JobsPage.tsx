import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { BriefcaseIcon, PinIcon, WalletIcon } from '../components/common/Icons';
import { FilterBar } from '../components/job/FilterBar';
import { JobGridSkeleton } from '../components/job/JobCardSkeleton';
import { PageHeader } from '../components/layout/PageHeader';
import { useJobs } from '../hooks/useJob';
import { useLocations } from '../hooks/useLocations';
import { getErrorMessage, getErrorTitle } from '../services/api/errors';
import { DEFAULT_FILTERS, type JobFilters } from '../types/recommendation';
import { filterJobs } from '../utils/filters';
import { formatEmploymentType, formatExperience, formatSalary, uniqueSorted } from '../utils/formatting';
import { jobLocationName } from '../utils/location';
import { SkillList } from '../components/candidate/SkillList';

export function JobsPage() {
  const { data, isPending, isError, error, refetch } = useJobs();
  const locationsQuery = useLocations();
  const [filters, setFilters] = useState<JobFilters>({ ...DEFAULT_FILTERS, sort: 'salary-desc' });

  const jobs = data;
  const visible = useMemo(() => filterJobs(jobs ?? [], filters), [jobs, filters]);
  const locations = useMemo(
    () =>
      uniqueSorted([
        ...(locationsQuery.data ?? []).map((location) => location.name),
        ...(jobs ?? []).map((job) => jobLocationName(job)),
      ]),
    [jobs, locationsQuery.data],
  );

  return (
    <div className="page">
      <PageHeader
        backTo="/"
        title="Browse jobs"
        subtitle="Search open roles. Personalized match scores appear after you choose a candidate."
        actions={
          <Link className="btn btn-secondary" to="/jobs/new">
            Add job
          </Link>
        }
      />

      {isPending ? <JobGridSkeleton count={4} /> : null}

      {isError ? (
        <ErrorState
          title={getErrorTitle(error, 'Unable to load jobs.')}
          message={getErrorMessage(error, 'Please try again.')}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && jobs?.length === 0 ? (
        <EmptyState
          title="No jobs found"
          message="The job graph is empty. Seed the database, or add a job."
          action={
            <Link className="btn btn-primary" to="/jobs/new">
              Add job
            </Link>
          }
        />
      ) : null}

      {!isPending && !isError && (jobs?.length ?? 0) > 0 ? (
        <>
          <FilterBar
            filters={filters}
            locations={locations}
            onChange={setFilters}
            showMatchFilter={false}
            showMatchSort={false}
          />
          {visible.length === 0 ? (
            <EmptyState
              title="No jobs found"
              message="Try another location or employment type."
              action={
                <button type="button" className="btn btn-secondary" onClick={() => setFilters({ ...DEFAULT_FILTERS, sort: 'salary-desc' })}>
                  Reset filters
                </button>
              }
            />
          ) : (
            <div className="jobs-grid">
              {visible.map((job) => (
                <article key={job.id} className="job-card">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company?.name ?? 'Company undisclosed'}</p>
                  <ul className="job-meta">
                    <li>
                      <PinIcon />
                      {jobLocationName(job)}
                    </li>
                    <li>
                      <WalletIcon />
                      {formatSalary(job.salary)}
                    </li>
                    <li>
                      <BriefcaseIcon />
                      {formatEmploymentType(job.employmentType)}
                    </li>
                    <li>{formatExperience(job.minExperienceYears)}</li>
                  </ul>
                  <p className="section-label">Required skills</p>
                  <SkillList skills={job.requiredSkills} emptyMessage="No required skills listed" />
                  <Link className="btn btn-primary job-card-cta" to={`/jobs/${job.id}`}>
                    View details
                  </Link>
                </article>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
