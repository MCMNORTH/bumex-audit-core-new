import { useState, useEffect } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  method: 'gps' | 'network' | 'passive';
}

export interface GeolocationState {
  location: GeolocationData | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
  method: string | null;
  accuracy: number | null;
}

export const useGeolocation = (requestOnMount = false) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permissionState: null,
    method: null,
    accuracy: null,
  });

  const checkPermission = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permissionState: permission.state }));
        return permission.state;
      }
      return null;
    } catch (error) {
      console.warn('Error checking geolocation permission:', error);
      return null;
    }
  };

  const requestLocation = async (): Promise<GeolocationData | null> => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser',
        loading: false 
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const permission = await checkPermission();
      
      if (permission === 'denied') {
        setState(prev => ({ 
          ...prev, 
          error: 'Location permission denied. To enable precise location, please allow location access in your browser settings and refresh the page.',
          loading: false 
        }));
        return null;
      }

      // Use the enhanced location system
      const { getBestEffortLocation } = await import('@/lib/location');
      const locationResult = await getBestEffortLocation({
        timeout: 20000,
        maxAttempts: 3,
        useWatchPosition: true,
        watchDuration: 8000
      });

      if (locationResult) {
        const locationData: GeolocationData = {
          latitude: locationResult.latitude,
          longitude: locationResult.longitude,
          accuracy: locationResult.accuracy,
          timestamp: locationResult.timestamp,
          method: locationResult.method,
        };
        
        setState(prev => ({ 
          ...prev, 
          location: locationData, 
          loading: false, 
          error: null,
          method: locationResult.method,
          accuracy: locationResult.accuracy
        }));
        
        console.log('Enhanced location obtained successfully:', locationData);
        return locationData;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Unable to determine your location. This may be due to weak GPS signal or browser restrictions.',
          loading: false 
        }));
        return null;
      }
    } catch (error) {
      let errorMessage = 'Failed to get location';
      
      if (error && typeof error === 'object' && 'code' in error) {
        switch ((error as GeolocationPositionError).code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. For iOS Safari: Settings > Privacy & Security > Location Services > Safari Websites > Ask. For Chrome: Click the location icon in the address bar.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Location unavailable. Try moving to an area with better GPS reception or enable high-accuracy mode.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out. Check your internet connection and GPS signal.';
            break;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      console.error('Enhanced geolocation error:', error);
      return null;
    }
  };

  useEffect(() => {
    if (requestOnMount) {
      requestLocation();
    }
    checkPermission();
  }, [requestOnMount]);

  return {
    ...state,
    requestLocation,
    checkPermission,
  };
};