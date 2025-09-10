import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { logger } from '@/utils/logger';

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
      logger.debug('Fetching IP address and geolocation...');
      
      // Get user's public IP address with geolocation data using ipapi.co (HTTPS)
      const geoResponse = await fetch('https://ipapi.co/json/');
      const geoData = await geoResponse.json();
      
      logger.debug('Fetched geolocation data (sanitized)');
      
      // Get user agent
      const userAgent = navigator.userAgent;
      logger.debug('User agent obtained');
      
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
      logger.warn('Failed to fetch IP/geolocation data');
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
        logger.warn('Fallback IP fetch also failed');
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
      logger.debug('Creating log entry');
      
      await addDoc(collection(db, 'logs'), {
        user_id: user.id,
        action,
        target_id: targetId,
        timestamp: new Date(),
        details: details || null,
        // Security: Hash IP and remove sensitive client information
        client_ip_hash: clientInfo.ip ? btoa(clientInfo.ip).slice(0, 10) : 'unknown',
        country: clientInfo.country,
        city: clientInfo.city,
        region: clientInfo.region
      });
      
      logger.debug('Log created successfully');
    } catch (error) {
      logger.error('Error creating log:', error);
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