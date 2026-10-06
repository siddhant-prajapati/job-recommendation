import { API_BASE_URL, USE_MOCK } from '../../config';
import type { ApiErrorBody } from '../../types/api';
import { markUsingFallback, shouldUseFallback } from '../fallback';
import { ApiError } from './errors';

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'The request timed out. Please try again.', 'Timeout');
    }
    throw new ApiError(0, 'Network error', 'Network Error');
  } finally {
    window.clearTimeout(timeoutId);
  }

  const body = await parseBody(response);

  if (!response.ok) {
    const errorBody = (body && typeof body === 'object' ? body : {}) as Partial<ApiErrorBody>;
    throw ApiError.fromBody(response.status, errorBody, `Request failed with status ${response.status}`);
  }

  return body as T;
}

export async function getWithFallback<T>(live: () => Promise<T>, dummy: () => Promise<T>): Promise<T> {
  if (USE_MOCK) {
    return dummy();
  }

  try {
    return await live();
  } catch (error) {
    if (shouldUseFallback(error)) {
      markUsingFallback();
      return dummy();
    }
    throw error;
  }
}
