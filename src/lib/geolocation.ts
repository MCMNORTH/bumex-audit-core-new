interface GeolocationData {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  user_agent: string;
  timestamp: number;
}

interface GeolocationCache {
  data: GeolocationData | null;
  expires: number;
}

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'geo_cache';
const REQUEST_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 2;

// In-memory cache for current session
let memoryCache: GeolocationData | null = null;

// Persistent localStorage cache
const getCachedData = (): GeolocationData | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const parsedCache: GeolocationCache = JSON.parse(cached);
    if (Date.now() > parsedCache.expires) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedCache.data;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const setCachedData = (data: GeolocationData): void => {
  try {
    const cache: GeolocationCache = {
      data,
      expires: Date.now() + CACHE_DURATION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    memoryCache = data;
  } catch (error) {
    // Silent failure for localStorage issues
  }
};

// Fetch with timeout and retry
const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const fetchGeolocationData = async (retryCount = 0): Promise<GeolocationData> => {
  try {
    // Primary service: ipapi.co
    const response = await fetchWithTimeout('https://ipapi.co/json/', REQUEST_TIMEOUT);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.ip) {
      throw new Error('Invalid response format');
    }

    return {
      ip: data.ip,
      country: data.country_name || 'Unknown',
      country_code: data.country_code || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown',
      user_agent: navigator.userAgent || 'Unknown',
      timestamp: Date.now()
    };
  } catch (error) {
    console.warn(`Geolocation fetch attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      // Exponential backoff: wait 1s, then 2s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return fetchGeolocationData(retryCount + 1);
    }

    // All retries failed, try fallback service
    try {
      const fallbackResponse = await fetchWithTimeout('https://api.ipify.org?format=json', REQUEST_TIMEOUT);
      const { ip } = await fallbackResponse.json();
      
      return {
        ip: ip || 'Unknown',
        country: 'Unknown',
        country_code: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'Unknown',
        isp: 'Unknown',
        user_agent: navigator.userAgent || 'Unknown',
        timestamp: Date.now()
      };
    } catch (fallbackError) {
      console.warn('Fallback geolocation service also failed:', fallbackError);
      
      // Return minimal data as last resort
      return {
        ip: 'Unknown',
        country: 'Unknown',
        country_code: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        timezone: 'Unknown',
        isp: 'Unknown',
        user_agent: navigator.userAgent || 'Unknown',
        timestamp: Date.now()
      };
    }
  }
};

export const getGeolocationData = async (forceRefresh = false): Promise<GeolocationData> => {
  // Return memory cache if available and not forcing refresh
  if (!forceRefresh && memoryCache) {
    return memoryCache;
  }

  // Check persistent cache if not forcing refresh
  if (!forceRefresh) {
    const cachedData = getCachedData();
    if (cachedData) {
      memoryCache = cachedData;
      return cachedData;
    }
  }

  // Fetch fresh data
  try {
    const data = await fetchGeolocationData();
    setCachedData(data);
    return data;
  } catch (error) {
    console.error('Critical geolocation error:', error);
    
    // Return cached data even if expired as last resort
    const staleCache = getCachedData();
    if (staleCache) {
      return staleCache;
    }

    // Return minimal fallback data
    return {
      ip: 'Unknown',
      country: 'Unknown',
      country_code: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
      isp: 'Unknown',
      user_agent: navigator.userAgent || 'Unknown',
      timestamp: Date.now()
    };
  }
};

export const isCountryAllowed = async (forceRefresh = false): Promise<boolean> => {
  try {
    const geoData = await getGeolocationData(forceRefresh);
    const allowedCountryCode = 'MR'; // Mauritania
    
    // If we can't determine the country, allow access (fail-open)
    if (geoData.country_code === 'Unknown') {
      return true;
    }
    
    return geoData.country_code === allowedCountryCode;
  } catch (error) {
    console.warn('Country check failed, allowing access:', error);
    // Fail-open: allow access if there's an error
    return true;
  }
};

// Legacy compatibility functions
export const getClientInfo = getGeolocationData;

// Clear cache utility (for debugging or manual refresh)
export const clearGeolocationCache = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    memoryCache = null;
  } catch (error) {
    // Silent failure
  }
};