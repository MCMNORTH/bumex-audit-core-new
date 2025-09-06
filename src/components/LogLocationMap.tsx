import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

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

export const LogLocationMap = ({ logs }: LogLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !logs.length) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 2,
        center: [0, 20],
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add markers for each log with location
      const logsWithLocation = logs.filter(log => log.latitude && log.longitude);
      
      logsWithLocation.forEach((log) => {
        if (!log.latitude || !log.longitude) return;

        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'log-marker';
        markerElement.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${log.precise_location ? '#10b981' : '#f59e0b'};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <div class="font-semibold text-sm mb-2">${log.user_name || 'Unknown User'}</div>
            <div class="text-xs space-y-1">
              <div><span class="font-medium">Action:</span> ${log.action}</div>
              <div><span class="font-medium">Time:</span> ${log.timestamp.toLocaleString()}</div>
              <div><span class="font-medium">Location:</span> ${log.city}, ${log.country}</div>
              <div><span class="font-medium">Type:</span> ${log.precise_location ? 'Precise GPS' : 'IP-based'}</div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        // Add marker to map
        new mapboxgl.Marker(markerElement)
          .setLngLat([log.longitude, log.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Fit map to show all markers
      if (logsWithLocation.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        logsWithLocation.forEach(log => {
          if (log.latitude && log.longitude) {
            bounds.extend([log.longitude, log.latitude]);
          }
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      setShowTokenInput(true);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, logs]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  const logsWithLocation = logs.filter(log => log.latitude && log.longitude);

  if (showTokenInput) {
    return (
      <div className="space-y-4">
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            To view log locations on the map, please enter your Mapbox public token.
            You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
          </AlertDescription>
        </Alert>
        <form onSubmit={handleTokenSubmit} className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
          <div className="flex space-x-2">
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGl..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
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
      <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
      <button
        onClick={() => setShowTokenInput(true)}
        className="text-sm text-blue-600 hover:underline"
      >
        Change Mapbox Token
      </button>
    </div>
  );
};