interface ClientInfo {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  user_agent: string;
}

let cachedClientInfo: ClientInfo | null = null;

export const getClientInfo = async (): Promise<ClientInfo> => {
  if (cachedClientInfo) {
    return cachedClientInfo;
  }

  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch client info');
    }
    
    const data = await response.json();
    
    cachedClientInfo = {
      ip: data.ip || 'Unknown',
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown',
      user_agent: navigator.userAgent || 'Unknown'
    };
    
    return cachedClientInfo;
    } catch (error) {
    // Security: Don't log detailed error information
    
    // Fallback client info for when geolocation fails
    const fallbackInfo: ClientInfo = {
      ip: 'Unknown',
      country: 'Unknown',
      country_code: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown',
      user_agent: navigator.userAgent || 'Unknown'
    };
    
    return fallbackInfo;
  }
};

export const isCountryAllowed = async (): Promise<boolean> => {
  try {
    const clientInfo = await getClientInfo();
    const allowedCountryCode = 'MR'; // Mauritania
    
    // If we can't determine the country, allow access (fail-open)
    if (clientInfo.country_code === 'Unknown') {
      return true;
    }
    
    return clientInfo.country_code === allowedCountryCode;
  } catch (error) {
    // Security: Don't log detailed geo-restriction errors
    // Fail-open: allow access if there's an error
    return true;
  }
};