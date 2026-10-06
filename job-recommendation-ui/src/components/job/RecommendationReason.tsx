import { useId, useState } from 'react';
import { CheckIcon } from '../common/Icons';

type RecommendationReasonProps = {
  matchedSkills: string[];
  requiredSkills: string[];
  reasons: string[];
  candidateExperienceYears?: number;
  minExperienceYears?: number;
  candidateLocation?: string;
  jobLocation?: string;
  defaultOpen?: boolean;
};

export function RecommendationReason({
  matchedSkills,
  requiredSkills,
  reasons,
  candidateExperienceYears,
  minExperienceYears,
  candidateLocation,
  jobLocation,
  defaultOpen = false,
}: RecommendationReasonProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const missingSkills = requiredSkills.filter(
    (skill) => !matchedSkills.some((matched) => matched.toLowerCase() === skill.toLowerCase()),
  );

  return (
    <div className="why-block">
      <button
        type="button"
        className="why-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Why is this recommended?
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div id={panelId} className="why-panel">
          <p className="why-heading">Why this job?</p>
          <ul className="why-list">
            {reasons.map((reason) => (
              <li key={reason}>
                <CheckIcon />
                {reason}
              </li>
            ))}
          </ul>

          <p className="why-heading">Skill connections</p>
          <ul className="why-skills">
            {matchedSkills.map((skill) => (
              <li key={skill} className="why-skill why-skill-match">
                <CheckIcon />
                {skill}
              </li>
            ))}
            {missingSkills.map((skill) => (
              <li key={skill} className="why-skill why-skill-miss">
                {skill}
              </li>
            ))}
          </ul>

          {minExperienceYears != null && candidateExperienceYears != null ? (
            <>
              <p className="why-heading">Experience</p>
              <p className="why-copy">
                Required: {minExperienceYears} years · You have: {candidateExperienceYears} years
              </p>
            </>
          ) : null}

          {jobLocation ? (
            <>
              <p className="why-heading">Location</p>
              <p className="why-copy">
                {jobLocation}
                {candidateLocation ? ` · You are in ${candidateLocation}` : ''}
              </p>
            </>
          ) : null}

          <p className="why-heading">Graph connection</p>
          <p className="why-copy">Matching skills and company history connect you to this job in the knowledge graph.</p>
        </div>
      ) : null}
    </div>
  );
}
