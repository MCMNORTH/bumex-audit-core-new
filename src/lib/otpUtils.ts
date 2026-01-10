import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocFromServer, deleteDoc, Timestamp } from 'firebase/firestore';
import { supabase } from '@/integrations/supabase/client';

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure storage (using simple btoa for now, can upgrade to crypto)
const hashOTP = (otp: string): string => {
  return btoa(otp + 'bumex-salt-2024');
};

// Store OTP in Firestore with expiration
export const storeOTP = async (userId: string, email: string, otp: string): Promise<void> => {
  const otpHash = hashOTP(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  
  await setDoc(doc(db, 'pending_otps', userId), {
    user_id: userId,
    email: email,
    otp_hash: otpHash,
    created_at: Timestamp.fromDate(now),
    expires_at: Timestamp.fromDate(expiresAt),
    attempts: 0,
    max_attempts: 3
  });

  // Best-effort confirmation that the doc exists on the server
  try {
    const check = await getDocFromServer(doc(db, 'pending_otps', userId));
    if (!check.exists()) {
      throw new Error('OTP document not available on server');
    }
  } catch (e) {
    // Silent fail for offline/AppCheck/rules issues
  }
};

// Verify OTP against stored value
export const verifyOTP = async (userId: string, enteredOtp: string): Promise<{ 
  valid: boolean; 
  error?: string;
}> => {
  try {
    let otpDoc;
    try {
      otpDoc = await getDocFromServer(doc(db, 'pending_otps', userId));
    } catch (e) {
      // Fallback to cache (offline-friendly)
      otpDoc = await getDoc(doc(db, 'pending_otps', userId));
    }

    if (!otpDoc.exists()) {
      return { valid: false, error: 'No OTP found. Please request a new code.' };
    }

    const otpData = otpDoc.data();
    const now = new Date();
    const expiresAt = otpData.expires_at.toDate();

    // Check if OTP has expired
    if (now > expiresAt) {
      await deleteDoc(doc(db, 'pending_otps', userId));
      return { valid: false, error: 'OTP has expired. Please request a new code.' };
    }

    // Check if max attempts exceeded
    if (otpData.attempts >= otpData.max_attempts) {
      await deleteDoc(doc(db, 'pending_otps', userId));
      return { valid: false, error: 'Too many attempts. Please request a new code.' };
    }

    // Verify OTP
    const enteredHash = hashOTP(enteredOtp);
    if (enteredHash === otpData.otp_hash) {
      // OTP is valid, delete it
      await deleteDoc(doc(db, 'pending_otps', userId));
      return { valid: true };
    } else {
      // Increment attempts
      await setDoc(doc(db, 'pending_otps', userId), {
        ...otpData,
        attempts: otpData.attempts + 1
      });

      const remainingAttempts = otpData.max_attempts - otpData.attempts - 1;
      return { 
        valid: false, 
        error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { valid: false, error: 'An error occurred. Please try again.' };
  }
};

// Send OTP email via Supabase Edge Function
export const sendOTPEmail = async (email: string, otp: string, userName?: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-otp-email', {
      body: { email, otp, userName }
    });
    
    if (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message || 'Failed to send verification email' };
  }
};

// Cleanup expired OTPs (can be called periodically)
export const cleanupExpiredOTP = async (userId: string): Promise<void> => {
  try {
    const otpDoc = await getDoc(doc(db, 'pending_otps', userId));
    
    if (otpDoc.exists()) {
      const otpData = otpDoc.data();
      const now = new Date();
      const expiresAt = otpData.expires_at.toDate();
      
      if (now > expiresAt) {
        await deleteDoc(doc(db, 'pending_otps', userId));
      }
    }
  } catch (error) {
    console.error('Error cleaning up OTP:', error);
  }
};
