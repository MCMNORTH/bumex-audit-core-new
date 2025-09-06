interface ClientInfo {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  user_agent: string;
  latitude?: number;
  longitude?: number;
  precise_location: boolean;
}

let cachedClientInfo: ClientInfo | null = null;

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    if (permission.state === 'granted') {
      return true;
    }
    
    // Request location permission by attempting to get position
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getPreciseLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting precise location:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  } catch (error) {
    console.error('Error getting precise location:', error);
    return null;
  }
};

export const getClientInfo = async (): Promise<ClientInfo> => {
  if (cachedClientInfo) {
    return cachedClientInfo;
  }

  try {
    // First get precise location
    const preciseLocation = await getPreciseLocation();
    
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch client info');
    }
    
    const data = await response.json();
    
    cachedClientInfo = {
      ip: data.ip || 'Unknown',
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown',
      user_agent: navigator.userAgent || 'Unknown',
      latitude: preciseLocation?.latitude || data.latitude,
      longitude: preciseLocation?.longitude || data.longitude,
      precise_location: !!preciseLocation
    };
    
    return cachedClientInfo;
  } catch (error) {
    console.error('Error fetching client info:', error);
    
    // Fallback client info for when geolocation fails
    const fallbackInfo: ClientInfo = {
      ip: 'Unknown',
      country: 'Unknown',
      country_code: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown',
      user_agent: navigator.userAgent || 'Unknown',
      precise_location: false
    };
    
    return fallbackInfo;
  }
};

export const isCountryAllowed = async (): Promise<boolean> => {
  try {
    // First check location permission
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      return false; // Block if no location permission
    }
    
    const clientInfo = await getClientInfo();
    const allowedCountryCode = 'MR'; // Mauritania
    
    // If we can't determine the country, allow access (fail-open)
    if (clientInfo.country_code === 'Unknown') {
      return true;
    }
    
    return clientInfo.country_code === allowedCountryCode;
  } catch (error) {
    console.error('Error checking country restriction:', error);
    // Fail-open: allow access if there's an error
    return true;
  }
};