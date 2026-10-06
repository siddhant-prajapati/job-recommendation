import { AlertIcon } from './Icons';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-card" role="alert">
      <span className="state-icon state-icon-error">
        <AlertIcon />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} variant="primary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
