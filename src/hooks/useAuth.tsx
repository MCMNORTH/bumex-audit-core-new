import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { User } from '@/types';
import { useLogging } from '@/hooks/useLogging';

// Cache for IP address to avoid multiple API calls
let cachedIpData: { 
  ip: string; 
  userAgent: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  isp?: string;
} | null = null;

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getClientInfo = async () => {
  if (cachedIpData) return cachedIpData;

  try {
    // Get user's public IP address with geolocation data using ipapi.co (HTTPS)
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    
    // Get user agent
    const userAgent = navigator.userAgent;
    
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
      return { 
        ip: 'unknown', 
        userAgent: navigator.userAgent || 'unknown' 
      };
    }
  }
};

const createLogWithClientInfo = async (action: string, targetId: string, details?: string, userId?: string) => {
  try {
    const clientInfo = await getClientInfo();
    
    await addDoc(collection(db, 'logs'), {
      user_id: userId || 'unknown',
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
  } catch (error) {
    console.error('Error creating log:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SECURITY: Reduced logging for production security
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('User document exists:', userDoc.exists());
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            console.log('User data:', userData);
            console.log('User approved:', userData.approved, 'User blocked:', userData.blocked);
            // SECURITY: Only set user if account is approved and not blocked
            if (userData.approved !== false && !userData.blocked) {
              console.log('Setting user in context');
              setUser(userData);
              
              // Log successful login with IP tracking
              await createLogWithClientInfo('login', userData.id, 'User logged in', userData.id);
            } else {
              console.log('User not approved or blocked');
              setUser(null);
              // Account pending approval or blocked - should show appropriate message
            }
          } else {
            console.log('User document does not exist');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth error:', error); // SECURITY: Generic error message
          setUser(null);
        }
      } else {
        console.log('No firebase user');
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // SECURITY: Reduced logging for sensitive operations
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // SECURITY: Generic error logging
      console.error('Authentication failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log logout before signing out
      if (user) {
        await createLogWithClientInfo('logout', user.id, 'User logged out', user.id);
      }
      
      await signOut(auth);
    } catch (error) {
      // SECURITY: Generic error logging
      console.error('Logout failed');
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};