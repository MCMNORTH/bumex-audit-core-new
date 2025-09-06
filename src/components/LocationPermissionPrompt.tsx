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
      <div className="space-y-3">
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Location access is disabled. To enable precise location tracking for security logs, 
            please allow location access in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-blue-200 bg-blue-50">
          <MapPin className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">How to enable location access:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>iPhone/iPad Safari:</strong> Settings → Privacy & Security → Location Services → Safari Websites → Ask</li>
                <li><strong>Chrome/Edge:</strong> Click the location icon (🌍) in the address bar → Always allow</li>
                <li><strong>Firefox:</strong> Click the shield icon → Turn off Enhanced Tracking Protection for this site</li>
              </ul>
              <p className="text-sm mt-2">After changing settings, refresh the page to try again.</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
            {loading ? 'Getting Location...' : 'Enable Location'}
          </Button>
        </AlertDescription>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </Alert>
      
      {(loading || error) && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-2">
              <p className="font-medium">For best location accuracy:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>iPhone users:</strong> Enable "Precise Location" in Settings → Privacy & Security → Location Services → Safari Websites</li>
                <li><strong>All users:</strong> Make sure you're in an area with good GPS signal (near windows, outdoors)</li>
                <li><strong>Chrome users:</strong> Allow "High accuracy" mode when prompted</li>
                <li>Wait a few seconds for the system to get multiple location fixes</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};