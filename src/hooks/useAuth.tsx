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
  authError: string | null;
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
      // Silent error for logging
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null); // Clear any previous auth errors
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            
            // Check if user is blocked
            if (userData.blocked) {
              setAuthError('Your account has been blocked. Please contact support for assistance.');
              setUser(null);
              await signOut(auth); // Sign out blocked users
              return;
            }
            
            // Check if user is approved
            if (userData.approved === false) {
              setAuthError('Your account is pending approval. Please wait for an administrator to approve your account.');
              setUser(null);
              await signOut(auth); // Sign out unapproved users
              return;
            }
            
            // User is approved and not blocked
            setUser(userData);
            
            // Log successful login with IP tracking
            await createLogWithClientInfo('login', userData.id, 'User logged in', userData.id);
          } else {
            setAuthError('User account not found. Please contact support.');
            setUser(null);
            await signOut(auth);
          }
        } catch (error) {
          setAuthError('An error occurred while accessing your account. Please try again.');
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
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};