import { ApiError } from './api/errors';

let usingFallback = false;
const listeners = new Set<() => void>();

export function shouldUseFallback(error: unknown): boolean {
  return error instanceof ApiError && !error.isTimeout && (error.status === 0 || error.status >= 500);
}

export function markUsingFallback(): void {
  if (usingFallback) {
    return;
  }
  usingFallback = true;
  listeners.forEach((listener) => listener());
}

export function isUsingFallback(): boolean {
  return usingFallback;
}

export function subscribeFallback(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
