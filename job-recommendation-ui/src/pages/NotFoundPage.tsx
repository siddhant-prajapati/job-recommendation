import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';

export function NotFoundPage() {
  return (
    <div className="page">
      <PageHeader title="Page not found" backTo="/" backLabel="Back to dashboard" />
      <EmptyState
        title="This page does not exist"
        message="The link may be outdated, or the route is not part of JobMatch."
        action={
          <Link className="btn btn-primary" to="/">
            Go to dashboard
          </Link>
        }
      />
    </div>
  );
}
