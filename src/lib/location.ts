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
  useWatchPosition?: boolean;
  watchDuration?: number;
}

// Detect if we're on mobile for better accuracy thresholds
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Attempts to get the most accurate location possible using multiple strategies
 */
export const getBestEffortLocation = async (
  options: LocationOptions = {}
): Promise<LocationResult | null> => {
  const mobile = isMobileDevice();
  const {
    timeout = 20000,
    maximumAge = 300000, // 5 minutes - allow cached positions
    accuracyThreshold = mobile ? 100 : 500, // Mobile: 100m, Desktop: 500m
    maxAttempts = 3,
    useWatchPosition = true,
    watchDuration = 8000 // 8 seconds of watching
  } = options;

  console.log('Starting location request with enhanced strategy:', {
    mobile,
    accuracyThreshold,
    useWatchPosition,
    watchDuration
  });

  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser');
    return null;
  }

  let bestLocation: LocationResult | null = null;
  const locations: LocationResult[] = [];

  // Strategy 1: Watch position for multiple fixes (more accurate)
  if (useWatchPosition) {
    try {
      console.log('Strategy 1: Using watchPosition for aggregated location fixes');
      
      bestLocation = await new Promise<LocationResult | null>((resolve) => {
        let watchId: number;
        let timeoutId: NodeJS.Timeout;
        let bestResult: LocationResult | null = null;
        
        const cleanup = () => {
          if (watchId !== undefined) {
            navigator.geolocation.clearWatch(watchId);
          }
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };

        timeoutId = setTimeout(() => {
          cleanup();
          console.log('Watch position timeout, returning best result:', bestResult);
          resolve(bestResult);
        }, watchDuration);

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const result: LocationResult = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              method: 'gps',
              timestamp: position.timestamp
            };

            locations.push(result);
            console.log(`Watch position fix ${locations.length}:`, {
              accuracy: result.accuracy,
              coords: `${result.latitude}, ${result.longitude}`
            });

            // Keep the most accurate result
            if (!bestResult || result.accuracy < bestResult.accuracy) {
              bestResult = result;
              console.log('New best location from watch:', bestResult.accuracy + 'm');
            }

            // If we achieve excellent accuracy, resolve early
            if (result.accuracy <= accuracyThreshold * 0.5) {
              console.log('Excellent accuracy achieved, stopping watch early');
              cleanup();
              resolve(bestResult);
            }
          },
          (error) => {
            console.warn('Watch position error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: timeout / 2,
            maximumAge: 0
          }
        );
      });

      if (bestLocation && bestLocation.accuracy <= accuracyThreshold) {
        console.log('Watch position achieved target accuracy:', bestLocation.accuracy + 'm');
        return bestLocation;
      }
    } catch (error) {
      console.warn('Watch position strategy failed:', error);
    }
  }

  // Strategy 2: Multiple getCurrentPosition attempts
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Strategy 2: getCurrentPosition attempt ${attempt}/${maxAttempts}`);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: timeout / maxAttempts,
            maximumAge: attempt === 1 ? 0 : maximumAge
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

      console.log(`getCurrentPosition attempt ${attempt} result:`, {
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

  // Strategy 3: Network-based fallback with longer cache time
  if (!bestLocation || bestLocation.accuracy > accuracyThreshold * 2) {
    try {
      console.log('Strategy 3: Network-based location fallback');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000 // 10 minutes for network-based
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
      coords: `${bestLocation.latitude}, ${bestLocation.longitude}`,
      totalFixes: locations.length + 1
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