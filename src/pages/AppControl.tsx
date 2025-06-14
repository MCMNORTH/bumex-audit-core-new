
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppControl } from '@/types';
import { Settings, Shield, AlertTriangle, Smartphone } from 'lucide-react';

const AppControlPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [appControl, setAppControl] = useState<AppControl>({
    maintenance_mode: false,
    maintenance_message: 'System is under maintenance. Please check back later.',
    force_update: false,
    current_version: '1.0.0',
  });

  useEffect(() => {
    fetchAppControl();
  }, []);

  const fetchAppControl = async () => {
    try {
      const docRef = doc(db, 'app_control', 'settings');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAppControl(docSnap.data() as AppControl);
      } else {
        // Create default settings if they don't exist
        await setDoc(docRef, appControl);
      }
    } catch (error) {
      console.error('Error fetching app control:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch app control settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'app_control', 'settings');
      await updateDoc(docRef, appControl);
      
      toast({
        title: 'Success',
        description: 'App control settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating app control:', error);
      toast({
        title: 'Error',
        description: 'Failed to update app control settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AppControl, value: any) => {
    setAppControl(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Only dev users can access this page
  if (user?.role !== 'dev') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">App Control Panel</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">App Control Panel</h1>
            <p className="text-gray-600">Manage system-wide application settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Maintenance Mode</span>
              </CardTitle>
              <CardDescription>
                Enable maintenance mode to prevent users from accessing the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                <Switch
                  id="maintenance-mode"
                  checked={appControl.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={appControl.maintenance_message}
                  onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                  placeholder="Enter maintenance message..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Version Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <span>Version Control</span>
              </CardTitle>
              <CardDescription>
                Manage app version and force update settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-version">Current Version</Label>
                <Input
                  id="current-version"
                  value={appControl.current_version}
                  onChange={(e) => handleInputChange('current_version', e.target.value)}
                  placeholder="1.0.0"
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force-update">Force Update</Label>
                  <p className="text-sm text-gray-500">
                    Force users to update to the latest version
                  </p>
                </div>
                <Switch
                  id="force-update"
                  checked={appControl.force_update}
                  onCheckedChange={(checked) => handleInputChange('force_update', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription>
                Current system configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Maintenance Status</Label>
                  <p className={`text-sm font-semibold ${
                    appControl.maintenance_mode ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {appControl.maintenance_mode ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Force Update</Label>
                  <p className={`text-sm font-semibold ${
                    appControl.force_update ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {appControl.force_update ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Application Version</Label>
                <p className="text-sm font-semibold text-gray-900">{appControl.current_version}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Message */}
        {appControl.maintenance_mode && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Maintenance Mode is Active
                  </p>
                  <p className="text-sm text-orange-700">
                    Users will see the maintenance message and cannot access the application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AppControlPage;
