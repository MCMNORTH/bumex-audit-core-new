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
} | null = null;

export const useLogging = () => {
  const { user } = useAuth();

  const getClientInfo = async () => {
    if (cachedIpData) return cachedIpData;

    try {
      console.log('Fetching IP address and geolocation...');
      
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
        isp: geoData.org
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
      
      await addDoc(collection(db, 'logs'), {
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
        isp: clientInfo.isp
      });
      
      console.log('Log created successfully');
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