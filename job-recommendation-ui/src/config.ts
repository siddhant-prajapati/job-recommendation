function trimTrailingSlash(value: string | undefined): string {
  return (value ?? '').replace(/\/$/, '');
}

const backendUrl = trimTrailingSlash(import.meta.env.VITE_BACKEND_URL);

export const BACKEND_URL = backendUrl;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (backendUrl ? `${backendUrl}/api` : '/api');

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const DEMO_CANDIDATE_ID = null;
