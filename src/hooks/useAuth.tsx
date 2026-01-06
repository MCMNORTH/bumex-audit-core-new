import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { User } from '@/types';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '@/lib/otpUtils';
import { getGeolocationData } from '@/lib/geolocation';

interface PendingAuth {
  userId: string;
  email: string;
  userName?: string;
  userData: User;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authError: string | null;
  pendingAuth: PendingAuth | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyCredentials: (email: string, password: string) => Promise<void>;
  sendOTP: () => Promise<void>;
  verifyOTPAndLogin: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


const createLogWithClientInfo = async (action: string, targetId: string, details?: string, userId?: string) => {
  try {
    const clientInfo = await getGeolocationData();
    
    await addDoc(collection(db, 'logs'), {
      user_id: userId || 'unknown',
      action,
      target_id: targetId,
      timestamp: new Date(),
      details: details || null,
      // Hash IP for privacy
      client_ip_hash: clientInfo.ip !== 'Unknown' ? btoa(clientInfo.ip).slice(0, 10) : 'unknown',
      user_agent: clientInfo.user_agent,
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
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [skipOTPCheck, setSkipOTPCheck] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError(null); // Clear any previous auth errors
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // If we're in the middle of OTP verification, don't process further
        if (!skipOTPCheck) {
          setLoading(false);
          return;
        }
        
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
            
            // Check if user is blocked
            if (userData.blocked) {
              setAuthError('Your account has been blocked. Please contact support for assistance.');
              setUser(null);
              await signOut(auth);
              setSkipOTPCheck(false);
              return;
            }
            
            // Check if user is approved
            if (userData.approved === false) {
              setAuthError('Your account is pending approval. Please wait for an administrator to approve your account.');
              setUser(null);
              await signOut(auth);
              setSkipOTPCheck(false);
              return;
            }
            
            // User is approved and not blocked
            setUser(userData);
            
            // Log successful login with IP tracking
            await createLogWithClientInfo('login', userData.id, 'User logged in with 2FA', userData.id);
          } else {
            setAuthError('User account not found. Please contact support.');
            setUser(null);
            await signOut(auth);
          }
        } catch (error) {
          setAuthError('An error occurred while accessing your account. Please try again.');
          setUser(null);
        }
        
        setSkipOTPCheck(false);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [skipOTPCheck]);

  // Step 1: Verify credentials and send OTP
  const verifyCredentials = async (email: string, password: string) => {
    try {
      // Validate email domain
      const allowedDomains = ['@bumex.mr', '@overcode.dev'];
      const isValidDomain = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
      
      if (!isValidDomain) {
        throw new Error('Access denied: Invalid email address.');
      }
      
      // Attempt to sign in to verify credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      // Fetch user data from Firestore to check status
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User account not found. Please contact support.');
      }
      
      const userData = { id: fbUser.uid, ...userDoc.data() } as User;
      
      // Check if user is blocked
      if (userData.blocked) {
        await signOut(auth);
        throw new Error('Your account has been blocked. Please contact support.');
      }
      
      // Check if user is approved
      if (userData.approved === false) {
        await signOut(auth);
        throw new Error('Your account is pending approval.');
      }
      
      // Sign out immediately - we'll sign back in after OTP verification
      await signOut(auth);
      
      // Store pending auth info
      const pendingAuthData: PendingAuth = {
        userId: fbUser.uid,
        email: email,
        userName: userData.first_name,
        userData: userData
      };
      setPendingAuth(pendingAuthData);
      
      // Generate and store OTP
      const otp = generateOTP();
      await storeOTP(fbUser.uid, email, otp);
      
      // Send OTP email
      const result = await sendOTPEmail(email, otp, userData.first_name);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification email');
      }
      
      // Log OTP sent event
      await createLogWithClientInfo('otp_sent', fbUser.uid, 'OTP sent for 2FA', fbUser.uid);
      
    } catch (error: any) {
      setPendingAuth(null);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      
      throw error;
    }
  };

  // Step 2: Resend OTP
  const sendOTP = async () => {
    if (!pendingAuth) {
      throw new Error('No pending authentication. Please start over.');
    }
    
    try {
      // Generate new OTP
      const otp = generateOTP();
      await storeOTP(pendingAuth.userId, pendingAuth.email, otp);
      
      // Send OTP email
      const result = await sendOTPEmail(pendingAuth.email, otp, pendingAuth.userName);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send verification email');
      }
      
      // Log OTP resent event
      await createLogWithClientInfo('otp_resent', pendingAuth.userId, 'OTP resent for 2FA', pendingAuth.userId);
      
    } catch (error: any) {
      throw error;
    }
  };

  // Step 3: Verify OTP and complete login
  const verifyOTPAndLogin = async (otp: string) => {
    if (!pendingAuth) {
      throw new Error('No pending authentication. Please start over.');
    }
    
    try {
      // Verify OTP
      const result = await verifyOTP(pendingAuth.userId, otp);
      
      if (!result.valid) {
        // Log failed OTP attempt
        await createLogWithClientInfo('otp_failed', pendingAuth.userId, result.error || 'Invalid OTP', pendingAuth.userId);
        throw new Error(result.error || 'Invalid verification code');
      }
      
      // OTP is valid - complete login
      // Set skipOTPCheck to true so onAuthStateChanged will process the login
      setSkipOTPCheck(true);
      
      // Set user directly from pending auth data
      setUser(pendingAuth.userData);
      
      // Log successful 2FA
      await createLogWithClientInfo('otp_verified', pendingAuth.userId, 'OTP verified successfully', pendingAuth.userId);
      
      // Clear pending auth
      setPendingAuth(null);
      
    } catch (error: any) {
      throw error;
    }
  };

  // Legacy login (kept for compatibility but shouldn't be used directly)
  const login = async (email: string, password: string) => {
    await verifyCredentials(email, password);
  };

  const logout = async () => {
    try {
      // Log logout before signing out
      if (user) {
        await createLogWithClientInfo('logout', user.id, 'User logged out', user.id);
      }
      
      await signOut(auth);
      setUser(null);
      setPendingAuth(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    authError,
    pendingAuth,
    login,
    logout,
    verifyCredentials,
    sendOTP,
    verifyOTPAndLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
