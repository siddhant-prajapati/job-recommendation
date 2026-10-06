import { Link } from 'react-router-dom';
import { DEMO_CANDIDATE_ID } from '../config';
import { CandidateCard } from '../components/candidate/CandidateCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import {
  BriefcaseIcon,
  NodesIcon,
  SearchIcon,
  SparkIcon,
  UserIcon,
} from '../components/common/Icons';
import { useCandidates } from '../hooks/useCandidate';
import { getErrorMessage, getErrorTitle } from '../services/api/errors';

export function HomePage() {
  const { data, isPending, isError, error, refetch } = useCandidates();
  const featuredId = DEMO_CANDIDATE_ID ?? data?.[0]?.id ?? null;
  const recsTo = featuredId ? `/candidates/${featuredId}/recommendations` : '#candidates';
  const profileTo = featuredId ? `/candidates/${featuredId}` : '#candidates';
  const relatedTo = featuredId ? `/candidates/${featuredId}#related` : '#candidates';

  return (
    <div className="page">
      <section className="hero-panel">
        <p className="eyebrow">Dashboard</p>
        <h1>Find jobs that match your skills</h1>
        <p className="hero-copy">
          Graph-powered job recommendations based on your skills, experience, location, and company
          connections — not just a keyword search.
        </p>
        {isPending ? (
          <button type="button" className="btn btn-warm" disabled>
            <SparkIcon />
            Loading recommendations…
          </button>
        ) : featuredId ? (
          <Link className="btn btn-warm" to={recsTo}>
            <SparkIcon />
            View recommendations
          </Link>
        ) : (
          <Link className="btn btn-warm" to="/candidates/new">
            Add a candidate
          </Link>
        )}
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Explore JobMatch</h2>
            <p className="muted">Jump to recommendations, search, profiles, and related graph insights.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          <Link className="dash-card" to={recsTo}>
            <SparkIcon />
            <h3>Job recommendations</h3>
            <p>Ranked roles with match scores and why they were suggested.</p>
          </Link>
          <Link className="dash-card" to="/jobs">
            <SearchIcon />
            <h3>Job search</h3>
            <p>Browse and filter open roles by location, type, and salary.</p>
          </Link>
          <Link className="dash-card" to="/jobs">
            <BriefcaseIcon />
            <h3>Job details</h3>
            <p>Open a role to see requirements, company, and match context.</p>
          </Link>
          <Link className="dash-card" to={profileTo}>
            <UserIcon />
            <h3>Candidate / profile</h3>
            <p>Skills, experience, location, and previous companies.</p>
          </Link>
          <Link className="dash-card" to={relatedTo}>
            <NodesIcon />
            <h3>Related skills / companies</h3>
            <p>Adjacent skills and employers from the recommendation graph.</p>
          </Link>
        </div>
      </section>

      <section id="candidates">
        <div className="section-heading">
          <div>
            <h2>Select a candidate</h2>
          </div>
          <Link className="btn btn-secondary" to="/candidates/new">
            Add candidate
          </Link>
        </div>

        {isPending ? (
          <div className="candidate-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="candidate-card candidate-card-skeleton">
                <div className="skeleton skeleton-chip" />
                <div className="skeleton-row">
                  <div className="skeleton skeleton-avatar" />
                  <div className="skeleton skeleton-title" />
                </div>
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        ) : null}

        {isError ? (
          <ErrorState
            title={getErrorTitle(error, 'Unable to load candidates.')}
            message={getErrorMessage(error, 'Please try again.')}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {data && data.length === 0 ? (
          <EmptyState
            title="No candidates yet"
            message="Seed the graph database, then refresh — or add a candidate."
            action={
              <Link className="btn btn-primary" to="/candidates/new">
                Add candidate
              </Link>
            }
          />
        ) : null}

        {data && data.length > 0 ? (
          <div className="candidate-grid">
            {data.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                featured={DEMO_CANDIDATE_ID != null && candidate.id === DEMO_CANDIDATE_ID}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
