import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface BackendErrorNoticeProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
}

export function BackendErrorNotice({ error, onRetry, title = 'Error' }: BackendErrorNoticeProps) {
  if (!error) return null;

  const errorMessage = error.message || 'An unexpected error occurred';

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
