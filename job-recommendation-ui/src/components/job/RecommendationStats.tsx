import type { RecommendationStats } from '../../utils/recommendations';

type RecommendationStatsProps = {
  stats: RecommendationStats;
  visibleCount?: number;
};

export function RecommendationStatsBar({ stats, visibleCount }: RecommendationStatsProps) {
  const showing = visibleCount != null && visibleCount !== stats.total;

  return (
    <section className="stats-grid" aria-label="Recommendation summary">
      <article className="stat-card">
        <strong>{showing ? `${visibleCount} of ${stats.total}` : stats.total}</strong>
        <span>Jobs found</span>
      </article>
      <article className="stat-card">
        <strong>{stats.strongMatches}</strong>
        <span>Strong matches</span>
      </article>
      <article className="stat-card">
        <strong>{stats.goodMatches}</strong>
        <span>Good matches</span>
      </article>
      <article className="stat-card">
        <strong>{stats.remoteJobs}</strong>
        <span>Remote jobs</span>
      </article>
      <article className="stat-card">
        <strong>{stats.skillMatches}</strong>
        <span>Skill matches</span>
      </article>
    </section>
  );
}
