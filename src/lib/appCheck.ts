import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';

// reCAPTCHA Enterprise site key
const RECAPTCHA_SITE_KEY = '6LcdD8crAAAAAFQIAF1-fmksvvEFqymce3YWJ1OK';

export const initAppCheck = (app: FirebaseApp) => {
  try {
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