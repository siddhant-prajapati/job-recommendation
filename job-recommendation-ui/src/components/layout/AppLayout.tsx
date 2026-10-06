import { useSyncExternalStore } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { USE_MOCK } from '../../config';
import { isUsingFallback, subscribeFallback } from '../../services/fallback';
import { SparkIcon } from '../common/Icons';

export function AppLayout() {
  const usingFallback = useSyncExternalStore(subscribeFallback, isUsingFallback, () => false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <SparkIcon />
          </span>
          <span>
            JobMatch
            <small>Graph-powered recommendations</small>
          </span>
        </NavLink>
        <nav className="topnav" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
        </nav>
      </header>
      {USE_MOCK ? (
        <p className="mock-banner" role="status">
          Showing demo data. Set <code>VITE_USE_MOCK=false</code> to use the Spring Boot API.
        </p>
      ) : usingFallback ? (
        <p className="mock-banner" role="status">
          Showing saved demo responses. The API is unreachable or returned a server error.
        </p>
      ) : null}
      <main id="main" className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
