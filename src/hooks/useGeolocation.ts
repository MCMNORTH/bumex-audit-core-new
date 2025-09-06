import { useState, useEffect } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationState {
  location: GeolocationData | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | null;
}

export const useGeolocation = (requestOnMount = false) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permissionState: null,
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
          error: 'Location permission denied. Please enable location access in your browser settings.',
          loading: false 
        }));
        return null;
      }

      return new Promise<GeolocationData | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData: GeolocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };
            
            setState(prev => ({ 
              ...prev, 
              location: locationData, 
              loading: false, 
              error: null 
            }));
            
            console.log('Location obtained successfully:', locationData);
            resolve(locationData);
          },
          (error) => {
            let errorMessage = 'Failed to get location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }
            
            setState(prev => ({ 
              ...prev, 
              error: errorMessage, 
              loading: false 
            }));
            
            console.warn('Geolocation error:', errorMessage);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000, // 1 minute
          }
        );
      });
    } catch (error) {
      const errorMessage = 'Unexpected error getting location';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      console.error('Geolocation error:', error);
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