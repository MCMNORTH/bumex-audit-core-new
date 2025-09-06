import React, { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface LogLocationMapProps {
  logs: Array<{
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    precise_location?: boolean;
    user_name?: string;
    action: string;
    timestamp: Date;
    city?: string;
    country?: string;
    location_accuracy?: number;
    location_method?: string;
  }>;
}

interface GoogleMapComponentProps {
  logs: LogLocationMapProps['logs'];
}

const GoogleMapComponent = ({ logs }: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

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
        initialCenter = { 
          lat: parseFloat(firstLogWithLocation.latitude.toString()), 
          lng: parseFloat(firstLogWithLocation.longitude.toString()) 
        };
        initialZoom = 10;
      }
    }

    console.log('Initializing map with center:', initialCenter, 'zoom:', initialZoom);
    
    // Initialize the map
    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    mapInstanceRef.current = map;

    // Clear previous markers and circles
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];
    
    circlesRef.current.forEach(circle => {
      circle.setMap(null);
    });
    circlesRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidBounds = false;

    // Filter logs that have location data
    const logsWithLocation = logs.filter(log => 
      (log.latitude && log.longitude) || (log.city && log.country)
    );

    console.log('Logs with location data:', logsWithLocation.length);

    const addMarker = async (log: typeof logs[0], position: google.maps.LatLng | google.maps.LatLngLiteral) => {
      console.log('Adding marker for log:', log.id, 'at position:', position);
      
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.style.width = '16px';
      markerElement.style.height = '16px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = log.precise_location ? '#10b981' : '#f59e0b';
      markerElement.style.border = '2px solid #ffffff';
      markerElement.style.cursor = 'pointer';
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: position,
        map: map,
        title: `${log.user_name} - ${log.action}`,
        content: markerElement,
      });

      console.log('Created marker at position:', position, 'for log:', log.id);

      // Create info window content
      const infoWindowContent = `
        <div style="max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${log.user_name}</h3>
          <div style="font-size: 12px; line-height: 1.4;">
            <div><strong>Action:</strong> ${log.action}</div>
            <div><strong>Time:</strong> ${log.timestamp.toLocaleString()}</div>
            <div><strong>Location:</strong> ${log.city || 'Unknown'}, ${log.country || 'Unknown'}</div>
            <div><strong>Coordinates:</strong> ${typeof position === 'object' && 'lat' in position ? position.lat : (position as google.maps.LatLng).lat()}, ${typeof position === 'object' && 'lng' in position ? position.lng : (position as google.maps.LatLng).lng()}</div>
            <div><strong>Type:</strong> <span style="color: ${log.precise_location ? '#10b981' : '#f59e0b'};">${log.precise_location ? 'Precise GPS' : 'IP-based'}</span></div>
            ${log.location_accuracy ? `<div><strong>Accuracy:</strong> ${Math.round(log.location_accuracy)}m</div>` : ''}
            ${log.location_method ? `<div><strong>Method:</strong> ${log.location_method}</div>` : ''}
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map: map,
        });
      });

      markersRef.current.push(marker);
      
      // Add accuracy circle for precise locations
      if (log.precise_location && log.location_accuracy) {
        const accuracyCircle = new google.maps.Circle({
          center: position,
          radius: log.location_accuracy,
          strokeColor: '#10b981',
          strokeOpacity: 0.4,
          strokeWeight: 1,
          fillColor: '#10b981',
          fillOpacity: 0.1,
          map: map,
        });
        
        // Store circle reference for cleanup
        circlesRef.current.push(accuracyCircle);
      }
      
      // Add to bounds if it's a valid position
      if (position) {
        bounds.extend(position);
        hasValidBounds = true;
      }
    };

    // Process logs with coordinates first
    logsWithLocation.forEach(log => {
      if (log.latitude && log.longitude) {
        // Use precise coordinates
        const lat = parseFloat(log.latitude.toString());
        const lng = parseFloat(log.longitude.toString());
        
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`Using precise coordinates for log ${log.id}:`, lat, lng);
          const position = { lat, lng };
          addMarker(log, position);
        } else {
          console.warn(`Invalid coordinates for log ${log.id}:`, log.latitude, log.longitude);
        }
      }
    });

    // Process logs that need geocoding
    const geocoder = new google.maps.Geocoder();
    logsWithLocation.forEach(log => {
      if (!log.latitude && !log.longitude && log.city && log.country) {
        // Geocode city/country
        console.log(`Geocoding location for log ${log.id}:`, log.city, log.country);
        const address = `${log.city}, ${log.country}`;
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            console.log(`Geocoded ${address} to:`, location.lat(), location.lng());
            addMarker(log, location);
          } else {
            console.warn(`Failed to geocode ${address}: ${status}`);
          }
        });
      }
    });

    // Fit map to show all markers or center on single location
    setTimeout(() => {
      if (logsWithLocation.length === 1 && logsWithLocation[0].latitude && logsWithLocation[0].longitude) {
        // For single precise location, center and zoom
        const singlePos = { 
          lat: parseFloat(logsWithLocation[0].latitude.toString()), 
          lng: parseFloat(logsWithLocation[0].longitude.toString()) 
        };
        map.setCenter(singlePos);
        map.setZoom(12);
      } else if (hasValidBounds && !bounds.isEmpty()) {
        // For multiple locations, fit bounds
        map.fitBounds(bounds);
        
        // Ensure minimum zoom level for single locations
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }
    }, 1000); // Give time for geocoding to complete

  }, [logs]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

const MapLoadingComponent = () => (
  <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">Loading map...</p>
    </div>
  </div>
);

const MapErrorComponent = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
    <div className="text-center">
      <p className="text-red-600 font-medium">Failed to load Google Maps</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
    </div>
  </div>
);

export const LogLocationMap: React.FC<LogLocationMapProps> = ({ logs }) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <MapLoadingComponent />;
      case Status.FAILURE:
        return <MapErrorComponent error="Google Maps API failed to load" />;
      case Status.SUCCESS:
        return <GoogleMapComponent logs={logs} />;
    }
  };

  // Check if we have any location data
  const hasLocationData = logs.some(log => 
    (log.latitude && log.longitude) || (log.city && log.country)
  );

  if (!hasLocationData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border">
        <div className="text-center">
          <p className="text-gray-600">No location data available for these logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC8-gUpAw7jqdCb63DVt6O5KZ7ISt-GXsA'}
        render={render}
        libraries={['marker', 'geometry', 'places']}
      />
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Precise GPS Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>IP-based Location</span>
        </div>
      </div>
    </div>
  );
};