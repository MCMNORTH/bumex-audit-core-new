import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GeoRestrictedProps {
  country?: string;
  countryCode?: string;
  isLocationPermissionDenied?: boolean;
}

export const GeoRestricted = ({ country, countryCode, isLocationPermissionDenied }: GeoRestrictedProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Globe className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isLocationPermissionDenied 
                ? "Location permission is required to use this application."
                : "This application is not available in your region."
              }
            </AlertDescription>
          </Alert>
          
          {country && countryCode && (
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Your current location:</p>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-medium">{country} ({countryCode})</p>
              </div>
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 space-y-2">
            {isLocationPermissionDenied ? (
              <>
                <p>Please allow location access and refresh the page to continue.</p>
                <p>Location permission is required for security and compliance purposes.</p>
              </>
            ) : (
              <>
                <p>If you believe this is an error, please contact support.</p>
                <p>If you're using a VPN, please disconnect and try again.</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};