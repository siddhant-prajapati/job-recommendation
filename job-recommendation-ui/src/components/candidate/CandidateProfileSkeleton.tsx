export function CandidateProfileSkeleton() {
  return (
    <div className="profile-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-back" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-avatar" />
        <div>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
      <div className="skeleton skeleton-block" />
      <div className="skill-list">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="skeleton skeleton-chip" />
        ))}
      </div>
      <div className="skeleton skeleton-cta" />
    </div>
  );
}
