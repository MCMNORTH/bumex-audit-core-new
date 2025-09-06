import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

// Cache for IP address and geolocation data to avoid multiple API calls
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
    if (cachedIpData) return cachedIpData;

    try {
      console.log('Fetching IP address and geolocation...');
      
      // Get precise location first
      const preciseLocation = await getPreciseLocation();
      
      // Get user's public IP address with geolocation data using ipapi.co (HTTPS)
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();
      
      console.log('Fetched geolocation data:', geoData);
      
      // Get user agent
      const userAgent = navigator.userAgent;
      console.log('User agent:', userAgent);
      
      cachedIpData = { 
        ip: geoData.ip || 'unknown',
        userAgent,
        country: geoData.country_name,
        city: geoData.city,
        region: geoData.region,
        timezone: geoData.timezone,
        isp: geoData.org,
        latitude: preciseLocation?.latitude || geoData.latitude,
        longitude: preciseLocation?.longitude || geoData.longitude,
        precise_location: !!preciseLocation
      };
      
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
        latitude: clientInfo.latitude,
        longitude: clientInfo.longitude,
        precise_location: clientInfo.precise_location
      };
      
      console.log('About to save log data:', logData);
      
      await addDoc(collection(db, 'logs'), logData);
      
      console.log('Log created successfully with location data:', {
        latitude: clientInfo.latitude,
        longitude: clientInfo.longitude,
        precise_location: clientInfo.precise_location,
        city: clientInfo.city,
        country: clientInfo.country
      });
    } catch (error) {
      console.error('Error creating log:', error);
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