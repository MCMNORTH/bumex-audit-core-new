// Centralized email domain validation for company-only access

export const ALLOWED_EMAIL_DOMAIN = '@bumex.mr';

export const isValidCompanyEmail = (email: string): boolean => {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith(ALLOWED_EMAIL_DOMAIN);
};

export const getEmailDomainError = (email: string): string | null => {
  if (!email || !email.includes('@')) return null;
  
  if (!isValidCompanyEmail(email)) {
    return `Access restricted to BUMEX employees only. Please use your ${ALLOWED_EMAIL_DOMAIN} email.`;
  }
  
  return null;
};
