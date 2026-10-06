import { Link } from 'react-router-dom';
import type { Candidate } from '../../types/candidate';
import type { JobRecommendation } from '../../types/recommendation';
import { formatEmploymentType, formatExperience, formatSalary } from '../../utils/formatting';
import { getMatchLabel, getMatchTier } from '../../utils/scoring';
import { Badge } from '../common/Badge';
import { ArrowRightIcon, BriefcaseIcon, PinIcon, WalletIcon } from '../common/Icons';
import { SkillList } from '../candidate/SkillList';
import { MatchScore } from './MatchScore';
import { RecommendationReason } from './RecommendationReason';

type JobCardProps = {
  job: JobRecommendation;
  candidate: Candidate;
};

export function JobCard({ job, candidate }: JobCardProps) {
  const tier = getMatchTier(job.matchScore);

  return (
    <article className="job-card">
      <div className="job-card-top">
        <MatchScore score={job.matchScore} />
        <Badge tone={tier}>{getMatchLabel(job.matchScore).replace(' Match', '')}</Badge>
      </div>

      <h3 className="job-title">{job.title}</h3>
      <p className="job-company">{job.company ?? 'Company undisclosed'}</p>

      <ul className="job-meta">
        <li>
          <PinIcon />
          {job.location}
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

      <p className="section-label">Matching skills</p>
      <SkillList skills={job.requiredSkills} highlighted={job.matchedSkills} emptyMessage="No required skills listed" />

      <RecommendationReason
        matchedSkills={job.matchedSkills}
        requiredSkills={job.requiredSkills}
        reasons={job.reasons}
        candidateExperienceYears={candidate.experienceYears}
        minExperienceYears={job.minExperienceYears}
        candidateLocation={candidate.location}
        jobLocation={job.location}
      />

      <Link className="btn btn-primary job-card-cta" to={`/jobs/${job.jobId}?candidateId=${candidate.id}`}>
        View details
        <ArrowRightIcon />
      </Link>
    </article>
  );
}
