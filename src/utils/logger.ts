/**
 * Secure logging utility that redacts sensitive information
 * and can be disabled in production for security
 */

const isProduction = import.meta.env.PROD;

// Sensitive data patterns to redact
const sensitivePatterns = [
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
  /user.*agent|mozilla|webkit|chrome|safari|firefox/gi, // User agent fragments
  /apikey|api_key|token|password|secret/gi, // API keys and secrets
  /email.*@.*\.com/gi, // Email addresses
  /authorization|bearer/gi, // Auth headers
];

const redactSensitiveData = (data: any): any => {
  if (typeof data === 'string') {
    let redacted = data;
    sensitivePatterns.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]');
    });
    return redacted;
  }
  
  if (typeof data === 'object' && data !== null) {
    const redacted: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Redact sensitive keys
        if (/ip|user_agent|email|password|token|key/i.test(key)) {
          redacted[key] = '[REDACTED]';
        } else {
          redacted[key] = redactSensitiveData(data[key]);
        }
      }
    }
    return redacted;
  }
  
  return data;
};

export const logger = {
  info: (...args: any[]) => {
    if (!isProduction) {
      console.info(...args.map(redactSensitiveData));
    }
  },
  
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args.map(redactSensitiveData));
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but redact sensitive data
    console.error(...args.map(redactSensitiveData));
  },
  
  debug: (...args: any[]) => {
    if (!isProduction) {
      console.debug(...args.map(redactSensitiveData));
    }
  },
  
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args.map(redactSensitiveData));
    }
  }
};