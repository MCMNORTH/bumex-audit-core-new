import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';

// reCAPTCHA Enterprise site key
const RECAPTCHA_SITE_KEY = '6LcdD8crAAAAAFQIAF1-fmksvvEFqymce3YWJ1OK';

// Debug token for development environments
const DEBUG_TOKEN = '5C87992B-CF0A-4D5E-B72B-5964FC09E1B2';

// Check if we're in development/preview environment
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('lovable.dev') || 
         hostname.includes('localhost') || 
         hostname === '127.0.0.1';
};

export const initAppCheck = (app: FirebaseApp) => {
  try {
    // Set debug token for development environments
    if (isDevelopment()) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = DEBUG_TOKEN;
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    
    return appCheck;
  } catch (error) {
    // App Check initialization failed - app will continue to work
    // but without App Check protection
    return null;
  }
};