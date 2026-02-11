import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const SecurityWarning = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Your account is pending approval. Please contact an administrator to activate your account.
      </AlertDescription>
    </Alert>
  );
};