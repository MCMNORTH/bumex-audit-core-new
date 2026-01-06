import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { User } from '@/types';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '@/lib/otpUtils';
import { getGeolocationData } from '@/lib/geolocation';

interface PendingAuth {
  userId: string;
  email: string;
  password: string; // Store password temporarily for re-auth after OTP
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

// Helper to check if user has a pending (non-expired) OTP
const hasPendingOTP = async (userId: string): Promise<boolean> => {
  try {
    const otpDoc = await getDoc(doc(db, 'pending_otps', userId));
    if (!otpDoc.exists()) return false;
    
    const data = otpDoc.data();
    const expiresAt = data.expires_at?.toDate?.();
    if (!expiresAt) return false;
    
    // If not expired, there's a pending OTP
    return new Date() < expiresAt;
  } catch (error) {
    // If we can't check (permissions, offline), assume no pending OTP
    console.warn('[2FA] Could not check pending OTP:', error);
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  // Track if we're in the middle of 2FA flow (password verified, awaiting OTP)
  const twoFactorPendingRef = useRef(false);
  // Track if 2FA was completed this session (to allow login after OTP verification)
  const twoFactorCompletedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setAuthError(null);
      
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // If we're in 2FA pending state (in-memory), keep user null
        if (twoFactorPendingRef.current) {
          setLoading(false);
          return;
        }
        
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (!userDoc.exists()) {
            setAuthError('User account not found. Please contact support.');
            setUser(null);
            await signOut(auth);
            setLoading(false);
            return;
          }
          
          const userData = { id: fbUser.uid, ...userDoc.data() } as User;
          
          // Check if user is blocked
          if (userData.blocked) {
            setAuthError('Your account has been blocked. Please contact support for assistance.');
            setUser(null);
            await signOut(auth);
            setLoading(false);
            return;
          }
          
          // Check if user is approved
          if (userData.approved === false) {
            setAuthError('Your account is pending approval. Please wait for an administrator to approve your account.');
            setUser(null);
            await signOut(auth);
            setLoading(false);
            return;
          }
          
          // Check if there's a pending OTP for this user (prevents refresh bypass)
          // Skip this check if 2FA was just completed in this session
          if (!twoFactorCompletedRef.current) {
            const hasPending = await hasPendingOTP(fbUser.uid);
            if (hasPending) {
              console.log('[2FA] Pending OTP found on auth state change - signing out to enforce 2FA');
              // User has a pending OTP - they haven't completed 2FA
              // Sign them out to force re-authentication
              await signOut(auth);
              setUser(null);
              setFirebaseUser(null);
              setAuthError('Session expired. Please sign in again.');
              setLoading(false);
              return;
            }
          }
          
          // User is approved, not blocked, and no pending OTP - set user state
          setUser(userData);
          twoFactorCompletedRef.current = false; // Reset for next login
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthError('An error occurred while accessing your account. Please try again.');
          setUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        twoFactorCompletedRef.current = false;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Step 1: Verify credentials and send OTP
  const verifyCredentials = async (email: string, password: string) => {
    try {
      // Validate email domain - only @bumex.mr allowed
      const allowedDomain = '@bumex.mr';
      if (!email.toLowerCase().trim().endsWith(allowedDomain)) {
        throw new Error('Access restricted to BUMEX employees only. Please use your @bumex.mr email.');
      }
      
      // Mark that we're entering 2FA flow BEFORE signing in
      twoFactorPendingRef.current = true;
      
      // Attempt to sign in to verify credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      // Fetch user data from Firestore to check status
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        twoFactorPendingRef.current = false;
        await signOut(auth);
        throw new Error('User account not found. Please contact support.');
      }
      
      const userData = { id: fbUser.uid, ...userDoc.data() } as User;
      
      // Check if user is blocked
      if (userData.blocked) {
        twoFactorPendingRef.current = false;
        await signOut(auth);
        throw new Error('Your account has been blocked. Please contact support.');
      }
      
      // Check if user is approved
      if (userData.approved === false) {
        twoFactorPendingRef.current = false;
        await signOut(auth);
        throw new Error('Your account is pending approval.');
      }
      
      // Store pending auth info (keep Firebase auth active for Firestore access)
      const pendingAuthData: PendingAuth = {
        userId: fbUser.uid,
        email: email,
        password: password, // Store for potential re-auth
        userName: userData.first_name,
        userData: userData
      };
      setPendingAuth(pendingAuthData);
      
      // Generate and store OTP (user is still authenticated, so Firestore write works)
      const otp = generateOTP();
      console.log('[2FA] Storing OTP for user:', fbUser.uid);
      await storeOTP(fbUser.uid, email, otp);
      console.log('[2FA] OTP stored successfully');
      
      // Send OTP email
      console.log('[2FA] Sending OTP email to:', email);
      const result = await sendOTPEmail(email, otp, userData.first_name);
      if (!result.success) {
        console.error('[2FA] Failed to send OTP email:', result.error);
        throw new Error(result.error || 'Failed to send verification email');
      }
      console.log('[2FA] OTP email sent successfully');
      
      // Log OTP sent event
      await createLogWithClientInfo('otp_sent', fbUser.uid, 'OTP sent for 2FA', fbUser.uid);
      
    } catch (error: any) {
      twoFactorPendingRef.current = false;
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
      // Verify OTP (user is still authenticated from step 1)
      console.log('[2FA] Verifying OTP for user:', pendingAuth.userId);
      const result = await verifyOTP(pendingAuth.userId, otp);
      
      if (!result.valid) {
        // Log failed OTP attempt
        await createLogWithClientInfo('otp_failed', pendingAuth.userId, result.error || 'Invalid OTP', pendingAuth.userId);
        throw new Error(result.error || 'Invalid verification code');
      }
      
      console.log('[2FA] OTP verified successfully');
      
      // OTP is valid - complete login
      // Mark 2FA as completed so onAuthStateChanged won't block
      twoFactorCompletedRef.current = true;
      twoFactorPendingRef.current = false;
      
      // Set user directly from pending auth data
      setUser(pendingAuth.userData);
      
      // Log successful 2FA
      await createLogWithClientInfo('otp_verified', pendingAuth.userId, 'OTP verified successfully', pendingAuth.userId);
      await createLogWithClientInfo('login', pendingAuth.userId, 'User logged in with 2FA', pendingAuth.userId);
      
      // Clear pending auth
      setPendingAuth(null);
      
    } catch (error: any) {
      console.error('[2FA] OTP verification error:', error);
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
      
      // Clear all auth state
      twoFactorPendingRef.current = false;
      twoFactorCompletedRef.current = false;
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
