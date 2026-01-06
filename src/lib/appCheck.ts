import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';
import type { AppCheck } from 'firebase/app-check';
// reCAPTCHA Enterprise site key
const RECAPTCHA_SITE_KEY = '6LcdD8crAAAAAFQIAF1-fmksvvEFqymce3YWJ1OK';

// Debug token for development environments
const DEBUG_TOKEN = '6EAC02E4-1802-4537-AF11-F16CC3B15A50';

// Check if we're in development/preview environment
const isDevelopment = () => {
  const hostname = window.location.hostname;
  // Development/preview environments should use debug token
  // Production domains like bumex.overcode.dev, auditcore.bumex.mr should use reCAPTCHA
  return hostname.includes('lovable.dev') || 
         hostname.includes('lovable.app') || 
         hostname.includes('lovableproject.com') ||
         hostname.includes('localhost') || 
         hostname === '127.0.0.1';
};
let appCheckInstance: AppCheck | null = null;

export const initAppCheck = (app: FirebaseApp) => {
  try {
    const hostname = window.location.hostname;
    
    // Set debug token ONLY for development environments (lovable.dev, localhost)
    if (isDevelopment()) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = DEBUG_TOKEN;
    }

    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    
    return appCheckInstance;
  } catch (error) {
    // App Check initialization failed - app will continue to work
    // but without App Check protection
    appCheckInstance = null;
    return null;
  }
};

// Helper to get current App Check token for REST calls
export const getAppCheckToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    if (!appCheckInstance) {
      return null;
    }
    const { token } = await getToken(appCheckInstance, forceRefresh);
    return token ?? null;
  } catch (error) {
    return null;
  }
};