import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationPermissionPromptProps {
  onLocationGranted?: (location: { latitude: number; longitude: number }) => void;
  onLocationDenied?: () => void;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  onLocationGranted,
  onLocationDenied,
}) => {
  const { requestLocation, loading, error, permissionState } = useGeolocation();

  const handleRequestLocation = async () => {
    const location = await requestLocation();
    if (location) {
      onLocationGranted?.(location);
    } else {
      onLocationDenied?.();
    }
  };

  if (permissionState === 'granted') {
    return null;
  }

  if (permissionState === 'denied') {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Location access is disabled. To enable precise location tracking for security logs, 
          please allow location access in your browser settings and refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <MapPin className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 flex items-center justify-between">
        <span>
          Enable location tracking for enhanced security monitoring? 
          This helps track login locations and suspicious activity.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRequestLocation}
          disabled={loading}
          className="ml-4"
        >
          {loading ? 'Requesting...' : 'Enable Location'}
        </Button>
      </AlertDescription>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </Alert>
  );
};