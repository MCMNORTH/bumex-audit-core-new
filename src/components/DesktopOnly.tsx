import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DesktopOnlyProps {
  children: React.ReactNode;
}

export const DesktopOnly = ({ children }: DesktopOnlyProps) => {
  const isMobile = useIsMobile();
  
  // Check if screen is smaller than desktop (1280px) with reactive listener
  const [isNonDesktop, setIsNonDesktop] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1280 : false
  );
  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 1279px)');
    const onChange = () => setIsNonDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    setIsNonDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (isMobile || isNonDesktop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="flex justify-center space-x-4 mb-6">
            <Smartphone className="h-8 w-8 text-muted-foreground" />
            <Tablet className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              Desktop Access Required
            </h1>
            <p className="text-muted-foreground">
              BUMEX Auditcore is designed for desktop use only. Please access this application from a computer or laptop.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Monitor className="h-12 w-12 text-primary" />
          </div>
          
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <p className="font-medium mb-1">Minimum Requirements:</p>
            <p>• Desktop or laptop computer</p>
            <p>• Screen width: 1280px or larger</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};