import type { Candidate } from '../../types/candidate';
import { formatExperienceYears, getInitials } from '../../utils/formatting';
import { inferRole } from '../../utils/role';
import { PinIcon } from '../common/Icons';

type CandidateSummaryProps = {
  candidate: Candidate;
};

export function CandidateSummary({ candidate }: CandidateSummaryProps) {
  return (
    <aside className="candidate-summary">
      <span className="avatar avatar-sm" aria-hidden="true">
        {getInitials(candidate.name)}
      </span>
      <div>
        <p className="candidate-summary-name">{candidate.name}</p>
        <p className="candidate-summary-meta">
          {inferRole(candidate.skills)} · <PinIcon /> {candidate.location} ·{' '}
          {formatExperienceYears(candidate.experienceYears)}
        </p>
      </div>
    </aside>
  );
}
