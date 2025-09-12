
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { isCountryAllowed, getGeolocationData } from '@/lib/geolocation';
import { GeoRestricted } from '@/components/GeoRestricted';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [geoLoading, setGeoLoading] = useState(true);
  const [isGeoAllowed, setIsGeoAllowed] = useState(true);
  const [clientInfo, setClientInfo] = useState<{ country: string; country_code: string } | null>(null);

  useEffect(() => {
    const checkGeolocation = async () => {
      try {
        const allowed = await isCountryAllowed();
        setIsGeoAllowed(allowed);
        
        if (!allowed) {
          const info = await getGeolocationData();
          setClientInfo({
            country: info.country,
            country_code: info.country_code
          });
        }
      } catch (error) {
        // Silent error for geolocation check
        // Fail-open: allow access on error
        setIsGeoAllowed(true);
      } finally {
        setGeoLoading(false);
      }
    };

    checkGeolocation();
  }, []);

  if (loading || geoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isGeoAllowed) {
    return <GeoRestricted country={clientInfo?.country} countryCode={clientInfo?.country_code} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
