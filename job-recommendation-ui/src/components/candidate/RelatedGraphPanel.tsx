import { Link } from 'react-router-dom';
import type { Candidate } from '../../types/candidate';
import { useRecommendations } from '../../hooks/useRecommendations';
import { getErrorMessage, getErrorTitle } from '../../services/api/errors';
import { relatedCompaniesFromRecommendations, relatedSkillsFromRecommendations } from '../../utils/related';
import { ErrorState } from '../common/ErrorState';
import { BuildingIcon } from '../common/Icons';
import { SkillList } from './SkillList';

type RelatedGraphPanelProps = {
  candidate: Candidate;
};

export function RelatedGraphPanel({ candidate }: RelatedGraphPanelProps) {
  const recommendationsQuery = useRecommendations(candidate.id);
  const recommendations = recommendationsQuery.data ?? [];
  const relatedSkills = relatedSkillsFromRecommendations(candidate.skills, recommendations);
  const relatedCompanies = relatedCompaniesFromRecommendations(candidate.previousCompanies, recommendations);

  return (
    <section id="related" className="related-section">
      <div className="section-heading">
        <div>
          <h2>Related skills & companies</h2>
          <p className="muted">
            Adjacent skills and employers from recommended jobs, loaded through the backend REST API.
          </p>
        </div>
      </div>

      {recommendationsQuery.isPending ? (
        <div className="related-grid" aria-busy="true">
          <div className="panel">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-chip" />
          </div>
          <div className="panel">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-chip" />
          </div>
        </div>
      ) : null}

      {recommendationsQuery.isError ? (
        <ErrorState
          title={getErrorTitle(recommendationsQuery.error, 'Unable to load related skills.')}
          message={getErrorMessage(recommendationsQuery.error, 'Please try again.')}
          onRetry={() => {
            void recommendationsQuery.refetch();
          }}
        />
      ) : null}

      {!recommendationsQuery.isPending && !recommendationsQuery.isError ? (
        <>
          <div className="related-grid">
            <section className="panel">
              <h3>Related skills</h3>
              <SkillList skills={relatedSkills} emptyMessage="No related skills found" />
            </section>

            <section className="panel">
              <h3>Related companies</h3>
              {relatedCompanies.length === 0 ? (
                <p className="muted">No related companies found</p>
              ) : (
                <ul className="skill-list">
                  {relatedCompanies.map((company) => (
                    <li key={company} className="skill-tag">
                      <BuildingIcon />
                      {company}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <Link className="btn btn-secondary" to={`/candidates/${candidate.id}/recommendations`}>
            See recommended jobs
          </Link>
        </>
      ) : null}
    </section>
  );
}
