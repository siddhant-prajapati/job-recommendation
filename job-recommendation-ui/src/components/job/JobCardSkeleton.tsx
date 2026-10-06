export function JobCardSkeleton() {
  return (
    <div className="job-card job-card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-score" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-chip" />
      </div>
      <div className="skeleton skeleton-block" />
      <div className="skeleton skeleton-cta" />
    </div>
  );
}

export function JobGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="jobs-grid" aria-busy="true" aria-label="Loading job recommendations">
      {Array.from({ length: count }, (_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}
