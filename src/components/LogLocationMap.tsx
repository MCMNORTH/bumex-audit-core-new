import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2 } from 'lucide-react';

// Ensure Google Maps types are available
declare global {
  interface Window {
    google: typeof google;
  }
}

interface LogLocationMapProps {
  logs: Array<{
    id: string;
    latitude?: number;
    longitude?: number;
    precise_location?: boolean;
    user_name?: string;
    action: string;
    timestamp: Date;
    city?: string;
    country?: string;
  }>;
}

interface GoogleMapComponentProps {
  logs: LogLocationMapProps['logs'];
}

const GoogleMapComponent = ({ logs }: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Determine initial center and zoom based on log data
    const firstLogWithLocation = logs.find(log => 
      (log.latitude && log.longitude) || (log.city && log.country)
    );
    
    let initialCenter = { lat: 20, lng: 0 };
    let initialZoom = 2;
    
    if (firstLogWithLocation) {
      if (firstLogWithLocation.latitude && firstLogWithLocation.longitude) {
        // Use precise GPS coordinates
        initialCenter = { lat: firstLogWithLocation.latitude, lng: firstLogWithLocation.longitude };
        initialZoom = 12; // Higher zoom for precise location
      } else if (firstLogWithLocation.city && firstLogWithLocation.country) {
        // Will be geocoded and centered later
        initialZoom = 8; // Medium zoom for city-level location
      }
    }

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each log with location
    const logsWithLocation = logs.filter(log => 
      (log.latitude && log.longitude) || (log.city && log.country)
    );
    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();

    const createMarker = (
      position: google.maps.LatLng | google.maps.LatLngLiteral, 
      log: any, 
      map: google.maps.Map, 
      bounds: google.maps.LatLngBounds
    ) => {
      // Create marker
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${log.user_name} - ${log.action}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: log.precise_location ? '#10b981' : '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      console.log('Created marker at position:', position, 'for log:', log.id);

      // Create info window content
      const infoWindowContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${log.user_name || 'Unknown User'}</div>
          <div style="font-size: 12px; line-height: 1.4;">
            <div><strong>Action:</strong> ${log.action}</div>
            <div><strong>Time:</strong> ${log.timestamp.toLocaleString()}</div>
            <div><strong>Location:</strong> ${log.city || 'Unknown'}, ${log.country || 'Unknown'}</div>
            <div><strong>Coordinates:</strong> ${typeof position === 'object' && 'lat' in position ? position.lat : (position as google.maps.LatLng).lat()}, ${typeof position === 'object' && 'lng' in position ? position.lng : (position as google.maps.LatLng).lng()}</div>
            <div><strong>Type:</strong> <span style="color: ${log.precise_location ? '#10b981' : '#f59e0b'};">${log.precise_location ? 'Precise GPS' : 'IP-based'}</span></div>
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      
      // Add to bounds if it's a valid position
      if (position) {
        bounds.extend(position);
      }
    };

    for (const log of logsWithLocation) {
      console.log('Processing log for map:', {
        id: log.id,
        latitude: log.latitude,
        longitude: log.longitude,
        city: log.city,
        country: log.country,
        precise_location: log.precise_location
      });

      let position: google.maps.LatLng | google.maps.LatLngLiteral;

      // If we have precise coordinates, use them
      if (log.latitude && log.longitude && !isNaN(log.latitude) && !isNaN(log.longitude)) {
        position = { 
          lat: parseFloat(log.latitude.toString()), 
          lng: parseFloat(log.longitude.toString()) 
        };
        console.log('Using precise coordinates:', position);
        createMarker(position, log, map, bounds);
      } else if (log.city && log.country) {
        // Geocode the city/country to get approximate coordinates
        const address = `${log.city}, ${log.country}`;
        console.log('Geocoding address:', address);
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            position = results[0].geometry.location;
            console.log('Geocoded position:', position);
            createMarker(position, log, map, bounds);
            
            // If this is the first location and we don't have precise GPS, center on it
            if (logsWithLocation.length === 1 && !log.latitude && !log.longitude) {
              map.setCenter(position);
              map.setZoom(10);
            }
          } else {
            console.warn('Geocoding failed:', status);
          }
        });
      } else {
        console.warn('No valid location data for log:', log.id);
      }
    }

    // Fit map to show all markers or center on single location
    if (logsWithLocation.length === 1 && logsWithLocation[0].latitude && logsWithLocation[0].longitude) {
      // For single precise location, center and zoom
      const singlePos = { 
        lat: parseFloat(logsWithLocation[0].latitude.toString()), 
        lng: parseFloat(logsWithLocation[0].longitude.toString()) 
      };
      map.setCenter(singlePos);
      map.setZoom(12);
    } else if (logsWithLocation.length > 1) {
      // For multiple locations, fit bounds after a delay to allow geocoding
      setTimeout(() => {
        if (bounds && !bounds.isEmpty()) {
          map.fitBounds(bounds);
          
          // Ensure minimum zoom level
          google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom()! > 15) {
              map.setZoom(15);
            }
          });
        }
      }, 1000);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [logs]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg border" />;
};

const MapLoadingComponent = () => (
  <div className="w-full h-96 rounded-lg border flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600">Loading Google Maps...</p>
    </div>
  </div>
);

const MapErrorComponent = ({ status }: { status: Status }) => (
  <div className="w-full h-96 rounded-lg border flex items-center justify-center bg-red-50">
    <div className="text-center">
      <MapPin className="h-8 w-8 mx-auto mb-2 text-red-400" />
      <p className="text-sm text-red-600">Failed to load Google Maps: {status}</p>
    </div>
  </div>
);

export const LogLocationMap = ({ logs }: LogLocationMapProps) => {
  const googleMapsApiKey = 'AIzaSyAHLc2W-ferlanM60hNseLhTVnPftSkseo';

  const renderMap = useCallback((status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <MapLoadingComponent />;
      case Status.FAILURE:
        return <MapErrorComponent status={status} />;
      case Status.SUCCESS:
        return <GoogleMapComponent logs={logs} />;
      default:
        return <MapLoadingComponent />;
    }
  }, [logs]);

  const logsWithLocation = logs.filter(log => 
    (log.latitude && log.longitude) || (log.city && log.country)
  );

  if (logsWithLocation.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MapPin className="mx-auto h-12 w-12 mb-2" />
        <p>No location data available in the current logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {logsWithLocation.length} log entries with location data
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Precise GPS</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>IP-based</span>
          </div>
        </div>
      </div>
      
      <Wrapper apiKey={googleMapsApiKey} render={renderMap} />
    </div>
  );
};