import { Link } from 'react-router-dom';
import type { Candidate } from '../../types/candidate';
import { formatExperienceYears, getInitials } from '../../utils/formatting';
import { inferRole } from '../../utils/role';
import { Badge } from '../common/Badge';
import { PinIcon } from '../common/Icons';

type CandidateCardProps = {
  candidate: Candidate;
  featured?: boolean;
};

export function CandidateCard({ candidate, featured = false }: CandidateCardProps) {
  const role = inferRole(candidate.skills);

  return (
    <article className={`candidate-card ${featured ? 'candidate-card-featured' : ''}`.trim()}>
      {featured ? <Badge tone="accent">Demo candidate</Badge> : null}
      <div className="candidate-card-identity">
        <span className="avatar" aria-hidden="true">
          {getInitials(candidate.name)}
        </span>
        <div>
          <h3>{candidate.name}</h3>
          <p>{role}</p>
        </div>
      </div>
      <p className="meta-row">
        <span>
          <PinIcon />
          {candidate.location}
        </span>
        <span>{formatExperienceYears(candidate.experienceYears)}</span>
      </p>
      <p className="skill-preview">
        {candidate.skills
          .slice(0, 4)
          .map((skill) => skill.name)
          .join(' · ')}
        {candidate.skills.length > 4 ? ` +${candidate.skills.length - 4}` : ''}
      </p>
      <Link className="btn btn-secondary" to={`/candidates/${candidate.id}`}>
        View profile
      </Link>
    </article>
  );
}
