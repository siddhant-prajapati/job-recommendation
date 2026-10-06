import type { ApiErrorBody } from '../../types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly path?: string;

  constructor(status: number, message: string, error = 'Error', path?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.path = path;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnavailable(): boolean {
    return this.status === 503;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isTimeout(): boolean {
    return this.error === 'Timeout';
  }

  get isInvalidRequest(): boolean {
    return this.status === 400;
  }

  get isNetworkError(): boolean {
    return this.status === 0 && !this.isTimeout;
  }

  static fromBody(status: number, body: Partial<ApiErrorBody>, fallback: string): ApiError {
    return new ApiError(
      body.status ?? status,
      body.message ?? fallback,
      body.error ?? 'Error',
      body.path,
    );
  }
}

export function getErrorTitle(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.isTimeout) {
      return 'Request timed out';
    }
    if (error.isNetworkError) {
      return 'Backend unavailable';
    }
    if (error.isUnavailable) {
      return 'Database unavailable';
    }
    if (error.isInvalidRequest) {
      return 'Invalid request';
    }
    if (error.isNotFound) {
      return 'No data found';
    }
    if (error.isServerError) {
      return 'API error';
    }
  }
  return fallback;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.isTimeout) {
      return 'The request timed out. Please try again.';
    }
    if (error.isNotFound) {
      return error.message;
    }
    if (error.isUnavailable) {
      return 'The recommendation engine is temporarily unavailable. CognoDB may be offline.';
    }
    if (error.isInvalidRequest) {
      return error.message || 'This request was invalid. Check the details and try again.';
    }
    if (error.isNetworkError) {
      return 'We could not reach the server. Check your connection and try again.';
    }
    if (error.isServerError) {
      return 'Something went wrong on our side. Please try again.';
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
