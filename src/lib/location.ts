interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  method: 'gps' | 'network' | 'passive';
  timestamp: number;
}

interface LocationOptions {
  timeout?: number;
  maximumAge?: number;
  accuracyThreshold?: number;
  maxAttempts?: number;
}

/**
 * Attempts to get the most accurate location possible using multiple strategies
 */
export const getBestEffortLocation = async (
  options: LocationOptions = {}
): Promise<LocationResult | null> => {
  const {
    timeout = 15000,
    maximumAge = 0,
    accuracyThreshold = 100, // 100 meters
    maxAttempts = 3
  } = options;

  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    return null;
  }

  let bestLocation: LocationResult | null = null;

  // Strategy 1: High accuracy GPS
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Location attempt ${attempt}/${maxAttempts} - High accuracy GPS`);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: timeout / maxAttempts,
            maximumAge: 0
          }
        );
      });

      const result: LocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        method: 'gps',
        timestamp: position.timestamp
      };

      console.log(`Attempt ${attempt} result:`, {
        accuracy: result.accuracy,
        method: result.method,
        coords: `${result.latitude}, ${result.longitude}`
      });

      // If this is our first result or it's more accurate, save it
      if (!bestLocation || result.accuracy < bestLocation.accuracy) {
        bestLocation = result;
      }

      // If we've achieved the desired accuracy, we can stop
      if (result.accuracy <= accuracyThreshold) {
        console.log(`Achieved target accuracy of ${accuracyThreshold}m on attempt ${attempt}`);
        break;
      }

    } catch (error) {
      console.warn(`High accuracy attempt ${attempt} failed:`, error);
    }
  }

  // Strategy 2: If no good result yet, try network-based location
  if (!bestLocation || bestLocation.accuracy > accuracyThreshold * 2) {
    try {
      console.log('Trying network-based location as fallback');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000 // Allow slightly older cached position
          }
        );
      });

      const result: LocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        method: 'network',
        timestamp: position.timestamp
      };

      console.log('Network-based result:', {
        accuracy: result.accuracy,
        method: result.method,
        coords: `${result.latitude}, ${result.longitude}`
      });

      // Use network result if we have no GPS result or it's significantly better
      if (!bestLocation || result.accuracy < bestLocation.accuracy * 0.8) {
        bestLocation = result;
      }

    } catch (error) {
      console.warn('Network-based location failed:', error);
    }
  }

  if (bestLocation) {
    console.log('Final best location:', {
      accuracy: bestLocation.accuracy,
      method: bestLocation.method,
      isPrecise: bestLocation.accuracy <= accuracyThreshold,
      coords: `${bestLocation.latitude}, ${bestLocation.longitude}`
    });
  } else {
    console.warn('No location could be obtained');
  }

  return bestLocation;
};

/**
 * Determines if a location should be considered "precise" based on accuracy
 */
export const isPreciseLocation = (accuracy: number): boolean => {
  return accuracy <= 100; // 100 meters or better
};