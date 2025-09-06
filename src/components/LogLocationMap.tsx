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

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 0 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each log with location
    const logsWithLocation = logs.filter(log => log.latitude && log.longitude);
    const bounds = new google.maps.LatLngBounds();

    logsWithLocation.forEach((log) => {
      if (!log.latitude || !log.longitude) return;

      const position = { lat: log.latitude, lng: log.longitude };

      // Create marker
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${log.user_name} - ${log.action}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: log.precise_location ? '#10b981' : '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Create info window content
      const infoWindowContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${log.user_name || 'Unknown User'}</div>
          <div style="font-size: 12px; line-height: 1.4;">
            <div><strong>Action:</strong> ${log.action}</div>
            <div><strong>Time:</strong> ${log.timestamp.toLocaleString()}</div>
            <div><strong>Location:</strong> ${log.city}, ${log.country}</div>
            <div><strong>Type:</strong> ${log.precise_location ? 'Precise GPS' : 'IP-based'}</div>
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
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (logsWithLocation.length > 0) {
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15);
        }
      });
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
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleMapsApiKey.trim()) {
      setShowApiKeyInput(false);
    }
  };

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

  const logsWithLocation = logs.filter(log => log.latitude && log.longitude);

  if (showApiKeyInput) {
    return (
      <div className="space-y-4">
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            To view log locations on the map, please enter your Google Maps API key.
            You can get one from the{' '}
            <a 
              href="https://console.cloud.google.com/google/maps-apis" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Google Cloud Console
            </a>
          </AlertDescription>
        </Alert>
        <form onSubmit={handleApiKeySubmit} className="space-y-2">
          <Label htmlFor="google-maps-api-key">Google Maps API Key</Label>
          <div className="flex space-x-2">
            <Input
              id="google-maps-api-key"
              type="text"
              placeholder="AIzaSyC..."
              value={googleMapsApiKey}
              onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              className="flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Load Map
            </button>
          </div>
        </form>
      </div>
    );
  }

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
      
      <button
        onClick={() => setShowApiKeyInput(true)}
        className="text-sm text-blue-600 hover:underline"
      >
        Change Google Maps API Key
      </button>
    </div>
  );
};