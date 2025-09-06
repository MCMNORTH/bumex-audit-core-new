import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useLogging } from '@/hooks/useLogging';
import { useAuth } from '@/hooks/useAuth';

export const TestLocationButton = () => {
  const { createLog } = useLogging();
  const { user } = useAuth();

  const handleTestLocation = async () => {
    if (!user) {
      console.warn('No user logged in');
      return;
    }
    
    console.log('Testing location logging...');
    await createLog('test_location', user.id, 'Location test triggered by user');
    console.log('Test location log created');
  };

  if (!user) return null;

  return (
    <Button 
      onClick={handleTestLocation} 
      variant="outline" 
      size="sm"
      className="mb-4"
    >
      <MapPin className="h-4 w-4 mr-2" />
      Test Location Logging
    </Button>
  );
};