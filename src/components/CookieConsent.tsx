import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (allAccepted.analytics) {
      initializeAnalytics();
    }
  };

  const acceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const rejectAll = () => {
    const rejected = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(rejected));
    setShowBanner(false);
  };

  const initializeAnalytics = () => {
    // Initialize your analytics here (Google Analytics, etc.)
    console.log('Analytics initialized');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
      <Card className="shadow-strong border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="font-semibold text-sm">We use cookies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  You can manage your preferences anytime.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={acceptAll}
                  size="sm" 
                  className="bg-gradient-primary text-xs"
                >
                  Accept All
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cookie Preferences</DialogTitle>
                      <DialogDescription>
                        Choose which cookies you'd like to accept. Some cookies are necessary for the site to function.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="necessary" className="text-sm font-medium">
                            Necessary Cookies
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Required for the website to function properly
                          </p>
                        </div>
                        <Switch 
                          id="necessary" 
                          checked={true} 
                          disabled 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="analytics" className="text-sm font-medium">
                            Analytics Cookies
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Help us understand how you use our website
                          </p>
                        </div>
                        <Switch 
                          id="analytics" 
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, analytics: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing" className="text-sm font-medium">
                            Marketing Cookies
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Used to show you relevant advertisements
                          </p>
                        </div>
                        <Switch 
                          id="marketing" 
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => 
                            setPreferences(prev => ({ ...prev, marketing: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={acceptSelected} className="flex-1">
                        Save Preferences
                      </Button>
                      <Button variant="outline" onClick={rejectAll}>
                        Reject All
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBanner(false)}
                  className="text-xs"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;