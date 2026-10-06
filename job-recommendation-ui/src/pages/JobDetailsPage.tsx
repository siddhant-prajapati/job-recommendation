import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SkillList } from '../components/candidate/SkillList';
import { ErrorState } from '../components/common/ErrorState';
import { BriefcaseIcon, PinIcon, WalletIcon } from '../components/common/Icons';
import { JobCardSkeleton } from '../components/job/JobCardSkeleton';
import { MatchScore } from '../components/job/MatchScore';
import { RecommendationReason } from '../components/job/RecommendationReason';
import { PageHeader } from '../components/layout/PageHeader';
import { useCandidate } from '../hooks/useCandidate';
import { useJob } from '../hooks/useJob';
import { useRecommendations } from '../hooks/useRecommendations';
import { getErrorMessage, getErrorTitle } from '../services/api/errors';
import { formatEmploymentType, formatExperience, formatSalary } from '../utils/formatting';
import { parseId } from '../utils/ids';
import { jobLocationName } from '../utils/location';

export function JobDetailsPage() {
  const { jobId } = useParams();
  const [params] = useSearchParams();
  const id = parseId(jobId);
  const candidateId = parseId(params.get('candidateId'));
  const hasCandidate = candidateId != null;

  const jobQuery = useJob(id);
  const candidateQuery = useCandidate(hasCandidate ? candidateId : undefined);
  const recommendationsQuery = useRecommendations(hasCandidate ? candidateId : undefined);

  const job = jobQuery.data;
  const candidate = candidateQuery.data;
  const match = recommendationsQuery.data?.find((item) => item.jobId === id);
  const isPending = jobQuery.isPending || (hasCandidate && (candidateQuery.isPending || recommendationsQuery.isPending));
  const error = jobQuery.error ?? candidateQuery.error ?? recommendationsQuery.error;

  if (id == null) {
    return (
      <div className="page">
        <PageHeader title="Job" backTo="/jobs" backLabel="Back to jobs" />
        <ErrorState title="Invalid request" message="This job id is not valid." />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="page page-narrow">
        <JobCardSkeleton />
      </div>
    );
  }

  if (jobQuery.isError || !job) {
    return (
      <div className="page">
        <PageHeader title="Job" backTo="/jobs" backLabel="Back to jobs" />
        <ErrorState
          title={getErrorTitle(error, 'Unable to load job.')}
          message={getErrorMessage(error, 'Please try again.')}
          onRetry={() => {
            void jobQuery.refetch();
            void candidateQuery.refetch();
            void recommendationsQuery.refetch();
          }}
        />
      </div>
    );
  }

  const backTo = hasCandidate
    ? `/candidates/${candidateId}/recommendations`
    : '/jobs';

  return (
    <div className="page page-narrow">
      <PageHeader
        backTo={backTo}
        backLabel={hasCandidate ? 'Back to recommendations' : 'Back to jobs'}
        title={job.title}
        subtitle={job.company?.name ?? 'Company undisclosed'}
      />

      <ul className="job-meta job-meta-lg">
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
      </ul>

      <section className="panel">
        <h2>Requirements</h2>
        <SkillList skills={job.requiredSkills} highlighted={match?.matchedSkills} emptyMessage="No required skills listed" />
        <p className="muted experience-note">Experience: {formatExperience(job.minExperienceYears)}</p>
      </section>

      {match && candidate ? (
        <section className="panel match-panel">
          <h2>Your match</h2>
          <MatchScore score={match.matchScore} />
          <p className="why-copy">
            You match {match.matchedSkillCount}/{match.requiredSkills.length} required skills.
          </p>
          <RecommendationReason
            matchedSkills={match.matchedSkills}
            requiredSkills={match.requiredSkills}
            reasons={match.reasons}
            candidateExperienceYears={candidate.experienceYears}
            minExperienceYears={match.minExperienceYears}
            candidateLocation={candidate.location}
            jobLocation={match.location || jobLocationName(job)}
            defaultOpen
          />
        </section>
      ) : null}

      <Link className="btn btn-secondary" to={backTo}>
        {hasCandidate ? 'Back to recommendations' : 'Browse jobs'}
      </Link>
    </div>
  );
}
