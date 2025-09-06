import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { User } from '@/types';

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
  timestamp?: number;
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
          timeout: 10000, 
          maximumAge: 0 // Always get fresh location
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
    cachedIpData = null;
  }
  
  if (cachedIpData) return cachedIpData;

  try {
    // Get precise location first
    const preciseLocation = await getPreciseLocation();
    
    // Get user's public IP address with geolocation data using ipapi.co (HTTPS)
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    
    // Get user agent
    const userAgent = navigator.userAgent;
    
    // Determine if we have precise location
    const hasPreciseLocation = preciseLocation !== null && 
                              preciseLocation.latitude !== undefined && 
                              preciseLocation.longitude !== undefined;
    
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
      isp: clientInfo.isp,
      latitude: clientInfo.latitude || null,
      longitude: clientInfo.longitude || null,
      precise_location: clientInfo.precise_location || false
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
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            // SECURITY: Only set user if account is approved and not blocked
            if (userData.approved !== false && !userData.blocked) {
              setUser(userData);
              
              // Log successful login with IP tracking
              await createLogWithClientInfo('login', userData.id, 'User logged in', userData.id);
            } else {
              setUser(null);
              // Account pending approval or blocked - should show appropriate message
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth error'); // SECURITY: Generic error message
          setUser(null);
        }
      } else {
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