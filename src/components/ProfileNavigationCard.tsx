import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useSidebar } from "@/components/ui/sidebar";
import { 
  Settings,
  LogOut,
  User,
  Crown,
  CreditCard,
  HelpCircle,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ProfileNavigationCard() {
  const { user } = useAuth();
  const { subscription, getCurrentPlan } = useSubscription();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  
  const currentPlan = getCurrentPlan();
  const planTier = currentPlan?.plan_id || (subscription?.is_trial ? 'trial' : 'free');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getPlanBadge = () => {
    switch (planTier) {
      case 'trial':
        return { text: "Trial", variant: "secondary" as const, icon: null };
      case 'personal':
        return { text: "Pro", variant: "default" as const, icon: <Crown className="h-3 w-3" /> };
      case 'business':
        return { text: "Business", variant: "default" as const, icon: <Crown className="h-3 w-3" /> };
      case 'enterprise':
        return { text: "Enterprise", variant: "default" as const, icon: <Crown className="h-3 w-3" /> };
      default:
        return { text: "Free", variant: "outline" as const, icon: null };
    }
  };

  const planBadge = getPlanBadge();
  const userInitials = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className="p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-auto p-2 hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{userName}</p>
                      <div className="flex items-center gap-1">
                        {planBadge.icon}
                        <Badge variant={planBadge.variant} className="text-xs">
                          {planBadge.text}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/billing-dashboard')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/support')}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{userName} ({planBadge.text})</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-auto p-3 hover:bg-accent/50 transition-colors group"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {planBadge.icon}
                <Badge variant={planBadge.variant} className="text-xs">
                  {planBadge.text}
                </Badge>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56 mb-2">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/billing-dashboard')}>
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/support')}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Support
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}