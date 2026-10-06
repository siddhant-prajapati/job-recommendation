import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CandidateProfileSkeleton } from '../components/candidate/CandidateProfileSkeleton';
import { RelatedGraphPanel } from '../components/candidate/RelatedGraphPanel';
import { SkillList } from '../components/candidate/SkillList';
import { ErrorState } from '../components/common/ErrorState';
import { BuildingIcon, PinIcon, ArrowLeftIcon } from '../components/common/Icons';
import { PageHeader } from '../components/layout/PageHeader';
import { useCandidate, useCandidateSkills } from '../hooks/useCandidate';
import { getErrorMessage, getErrorTitle } from '../services/api/errors';
import { formatExperienceYears, getInitials } from '../utils/formatting';
import { parseId } from '../utils/ids';
import { inferRole } from '../utils/role';

export function CandidatePage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const id = parseId(candidateId);
  const candidateQuery = useCandidate(id);
  const skillsQuery = useCandidateSkills(id);
  const { data, isPending, isError, error, refetch } = candidateQuery;

  useEffect(() => {
    if (!data || location.hash !== '#related') {
      return;
    }
    document.getElementById('related')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [data, location.hash]);

  if (id == null) {
    return (
      <div className="page">
        <PageHeader title="Candidate" backTo="/" backLabel="Back to dashboard" />
        <ErrorState title="Invalid request" message="This candidate id is not valid." />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="page">
        <CandidateProfileSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page">
        <PageHeader title="Candidate" backTo="/" backLabel="Back to dashboard" />
        <ErrorState
          title={getErrorTitle(error, 'Unable to load profile.')}
          message={getErrorMessage(error, 'Please try again.')}
          onRetry={() => {
            void refetch();
            void skillsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <ArrowLeftIcon />
        Back to dashboard
      </Link>
      <section className="profile-hero">
        <span className="avatar avatar-lg" aria-hidden="true">
          {getInitials(data.name)}
        </span>
        <div>
          <h1>{data.name}</h1>
          <p className="profile-role">{inferRole(skillsQuery.data ?? data.skills)}</p>
          <p className="meta-row">
            <span>
              <PinIcon />
              {data.location}
            </span>
            <span>{formatExperienceYears(data.experienceYears)}</span>
          </p>
        </div>
      </section>

      <section className="panel">
        <h2>Skills</h2>
        {skillsQuery.isError ? (
          <div>
            <p className="muted">We could not load skills. Showing profile skills instead.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                void skillsQuery.refetch();
              }}
            >
              Retry skills
            </button>
          </div>
        ) : null}
        <SkillList
          skills={skillsQuery.data ?? data.skills}
          emptyMessage="No skills found"
        />
      </section>

      <section className="panel">
        <h2>Previous companies</h2>
        {data.previousCompanies.length === 0 ? (
          <p className="muted">No previous companies on record.</p>
        ) : (
          <ul className="company-list">
            {data.previousCompanies.map((company) => (
              <li key={company.id}>
                <BuildingIcon />
                {company.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <RelatedGraphPanel candidate={data} />

      <Link className="btn btn-warm profile-cta" to={`/candidates/${data.id}/recommendations`}>
        Find recommended jobs
      </Link>
    </div>
  );
}
