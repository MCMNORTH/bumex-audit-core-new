import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';

// reCAPTCHA Enterprise site key
const RECAPTCHA_SITE_KEY = '6LcdD8crAAAAAFQIAF1-fmksvvEFqymce3YWJ1OK';

// Debug token for development environments
const DEBUG_TOKEN = '5C87992B-CF0A-4D5E-B72B-5964FC09E1B2';

// Check if we're in development/preview environment
const isDevelopment = () => {
  const hostname = window.location.hostname;
  // Only lovable.dev and localhost are development environments
  // Production domains like bumex.overcode.dev, auditcore.bumex.mr should use reCAPTCHA
  return hostname.includes('lovable.dev') || 
         hostname.includes('localhost') || 
         hostname === '127.0.0.1';
};

export const initAppCheck = (app: FirebaseApp) => {
  try {
    const hostname = window.location.hostname;
    
    // Set debug token ONLY for development environments (lovable.dev, localhost)
    if (isDevelopment()) {
      console.log('App Check: Using debug token for development environment:', hostname);
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = DEBUG_TOKEN;
    } else {
      console.log('App Check: Using reCAPTCHA Enterprise for production environment:', hostname);
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    
    console.log('App Check initialized successfully');
    return appCheck;
  } catch (error) {
    console.error('App Check initialization failed:', error);
    // App Check initialization failed - app will continue to work
    // but without App Check protection
    return null;
  }
};