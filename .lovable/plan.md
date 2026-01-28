
# Plan: Add auditcore.netlify.app as Secondary Domain

## Overview
Add `auditcore.netlify.app` to the allowed origins so it can communicate with the backend services.

## Changes Required

### 1. Update CORS Origins in Edge Function
**File:** `supabase/functions/send-otp-email/index.ts`

Add `https://auditcore.netlify.app` to the `ALLOWED_ORIGINS` array (line 7-14):

```typescript
const ALLOWED_ORIGINS = [
  "https://bumex.overcode.dev",
  "https://auditcore.bumex.mr",
  "https://auditcore.netlify.app",  // NEW
  "https://lovable.app",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:8080",
];
```

This allows the OTP email function to accept requests from your Netlify domain.

## Post-Implementation
After the change is made, the edge function will be automatically redeployed. Your Netlify-hosted version will then be able to:
- Send OTP verification emails
- Communicate with the backend services

## Optional: Firebase App Check
If you want this domain to use production reCAPTCHA instead of debug mode, no changes are needed - the domain doesn't match any development patterns, so it will automatically use production App Check.
