import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

import { getGeolocationData } from '@/lib/geolocation';

export const useLogging = () => {
  const { user } = useAuth();


  const createLog = async (action: string, targetId: string, details?: string) => {
    if (!user) return;

    try {
      const clientInfo = await getGeolocationData();
      
      await addDoc(collection(db, 'logs'), {
        user_id: user.id,
        action,
        target_id: targetId,
        timestamp: new Date(),
        details: details || null,
        // Remove sensitive client information from logs
        client_ip_hash: clientInfo.ip !== 'Unknown' ? btoa(clientInfo.ip).slice(0, 10) : 'unknown',
        country: clientInfo.country,
        city: clientInfo.city,
        region: clientInfo.region
      });
    } catch (error) {
      // Silent error for logging
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