import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <AlertTriangle className="h-24 w-24 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t('pageNotFound')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('pageNotFoundDesc')}
          </p>
        </div>

        <Button 
          onClick={() => window.location.href = '/'}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          {t('returnHome')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
