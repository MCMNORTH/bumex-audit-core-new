

# Plan: Fix Firebase App Check for auditcore.netlify.app

## Problem
The 403 errors are caused by Firebase App Check rejecting requests from `auditcore.netlify.app` because:
1. The domain is not in the `isDevelopment()` function, so it tries to use production reCAPTCHA
2. The reCAPTCHA Enterprise site key is not configured to allow this domain in Google Cloud Console

## Solution: Add Netlify Domain to Development Check (Option A)

This is the quickest fix that will get your Netlify deployment working immediately.

### File to Modify
**`src/lib/appCheck.ts`** - Update the `isDevelopment()` function

### Current Code (lines 11-20)
```typescript
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('lovable.dev') || 
         hostname.includes('lovable.app') || 
         hostname.includes('lovableproject.com') ||
         hostname.includes('localhost') || 
         hostname === '127.0.0.1';
};
```

### Updated Code
```typescript
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('lovable.dev') || 
         hostname.includes('lovable.app') || 
         hostname.includes('lovableproject.com') ||
         hostname.includes('netlify.app') ||
         hostname.includes('localhost') || 
         hostname === '127.0.0.1';
};
```

## What This Does
- Adds `netlify.app` to the development domain check
- When accessed from `auditcore.netlify.app`, the app will use the Firebase App Check debug token instead of reCAPTCHA Enterprise
- This bypasses the reCAPTCHA domain restriction issue

## Alternative: Production Configuration (Option B)
If you want `auditcore.netlify.app` to use proper production reCAPTCHA instead:

1. Go to Google Cloud Console -> Security -> reCAPTCHA Enterprise
2. Find site key `6LcdD8crAAAAAFQIAF1-fmksvvEFqymce3YWJ1OK`
3. Add `auditcore.netlify.app` to allowed domains
4. No code changes needed

## Recommendation
Option A (code change) is faster and works immediately. Option B is more secure for production but requires manual Google Cloud Console configuration.

