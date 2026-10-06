import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CandidatePage } from '../pages/CandidatePage';
import { CreateCandidatePage } from '../pages/CreateCandidatePage';
import { HomePage } from '../pages/HomePage';
import { CreateJobPage } from '../pages/CreateJobPage';
import { JobDetailsPage } from '../pages/JobDetailsPage';
import { JobsPage } from '../pages/JobsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RecommendationsPage } from '../pages/RecommendationsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/candidates/new" element={<CreateCandidatePage />} />
          <Route path="/candidates/:candidateId" element={<CandidatePage />} />
          <Route path="/candidates/:candidateId/recommendations" element={<RecommendationsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/new" element={<CreateJobPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
