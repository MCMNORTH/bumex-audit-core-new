import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

// Clear cache periodically to get fresh location data
let cachedIpData: { 
  ip: string; 
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
  latitude?: number;
  longitude?: number;
  precise_location?: boolean;
  timestamp?: number;
} | null = null;

export const useLogging = () => {
  const { user } = useAuth();

  const getPreciseLocation = async () => {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        return null;
      }

      return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Precise location obtained:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Precise location failed:', error.message);
            resolve(null);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 60000 // Use cached location if less than 1 minute old
          }
        );
      });
    } catch (error) {
      console.warn('Error getting precise location:', error);
      return null;
    }
  };

  const getClientInfo = async () => {
    // Check if cached data is too old (more than 5 minutes)
    if (cachedIpData && cachedIpData.timestamp && 
        Date.now() - cachedIpData.timestamp > 5 * 60 * 1000) {
      console.log('Cached location data is stale, refreshing...');
      cachedIpData = null;
    }
    
    if (cachedIpData) return cachedIpData;

    try {
      console.log('Fetching IP address and geolocation...');
      
      // Get precise location first
      const preciseLocation = await getPreciseLocation();
      console.log('Precise location result:', preciseLocation);
      
      // Get user's public IP address with geolocation data using ipapi.co (HTTPS)
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();
      
      console.log('Fetched geolocation data:', geoData);
      
      // Get user agent
      const userAgent = navigator.userAgent;
      console.log('User agent:', userAgent);
      
      // Determine if we have precise location
      const hasPreciseLocation = preciseLocation !== null && 
                                preciseLocation.latitude !== undefined && 
                                preciseLocation.longitude !== undefined;
      
      console.log('Has precise location:', hasPreciseLocation);
      
      cachedIpData = { 
        ip: geoData.ip || 'unknown',
        userAgent,
        country: geoData.country_name,
        city: geoData.city,
        region: geoData.region,
        timezone: geoData.timezone,
        isp: geoData.org,
        latitude: hasPreciseLocation ? preciseLocation.latitude : geoData.latitude,
        longitude: hasPreciseLocation ? preciseLocation.longitude : geoData.longitude,
        precise_location: hasPreciseLocation,
        timestamp: Date.now()
      };
      
      console.log('Final client info with precise location flag:', cachedIpData);
      
      return cachedIpData;
    } catch (error) {
      console.warn('Failed to fetch IP/geolocation data:', error);
      // Fallback to basic IP service
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        
        cachedIpData = { 
          ip, 
          userAgent: navigator.userAgent || 'unknown'
        };
        return cachedIpData;
      } catch (fallbackError) {
        console.warn('Fallback IP fetch also failed:', fallbackError);
        return { 
          ip: 'unknown', 
          userAgent: navigator.userAgent || 'unknown' 
        };
      }
    }
  };

  const createLog = async (action: string, targetId: string, details?: string) => {
    if (!user) return;

    try {
      // Clear cache to force fresh location data (same as test button)
      cachedIpData = null;
      
      const clientInfo = await getClientInfo();
      console.log('Creating log with client info:', clientInfo);
      
      const logData = {
        user_id: user.id,
        action,
        target_id: targetId,
        timestamp: new Date(),
        details: details || null,
        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        country: clientInfo.country,
        city: clientInfo.city,
        region: clientInfo.region,
        timezone: clientInfo.timezone,
        isp: clientInfo.isp,
        latitude: clientInfo.latitude || null,
        longitude: clientInfo.longitude || null,
        precise_location: clientInfo.precise_location || false
      };
      
      console.log('About to save log data to Firebase:', logData);
      console.log('Precise location data being saved:', {
        latitude: logData.latitude,
        longitude: logData.longitude,
        precise_location: logData.precise_location,
        hasValidCoords: !!(logData.latitude && logData.longitude)
      });
      
      const docRef = await addDoc(collection(db, 'logs'), logData);
      
      console.log('Log created successfully with document ID:', docRef.id);
      console.log('Saved location data:', {
        latitude: clientInfo.latitude,
        longitude: clientInfo.longitude,
        precise_location: clientInfo.precise_location,
        city: clientInfo.city,
        country: clientInfo.country
      });
    } catch (error) {
      console.error('Error creating log:', error);
      console.error('Error details:', error);
    }
  };

  const logUserAction = {
    create: (userId: string, details?: string) => createLog('created', userId, details),
    update: (userId: string, details?: string) => createLog('updated', userId, details),
    delete: (userId: string, details?: string) => createLog('deleted', userId, details),
    block: (userId: string) => createLog('blocked', userId, 'User blocked'),
    unblock: (userId: string) => createLog('unblocked', userId, 'User unblocked'),
    resetPassword: (userId: string) => createLog('password_reset', userId, 'Password reset sent'),
    login: () => createLog('login', user?.id || 'unknown', 'User logged in'),
    logout: () => createLog('logout', user?.id || 'unknown', 'User logged out'),
  };

  const logProjectAction = {
    create: (projectId: string, details?: string) => createLog('created', projectId, details),
    update: (projectId: string, details?: string) => createLog('updated', projectId, details),
    delete: (projectId: string, details?: string) => createLog('deleted', projectId, details),
  };

  const logClientAction = {
    create: (clientId: string, details?: string) => createLog('created', clientId, details),
    update: (clientId: string, details?: string) => createLog('updated', clientId, details),
    delete: (clientId: string, details?: string) => createLog('deleted', clientId, details),
  };

  return {
    createLog,
    logUserAction,
    logProjectAction,
    logClientAction
  };
};