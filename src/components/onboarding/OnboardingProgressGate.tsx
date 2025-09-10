import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, Star, Zap, Crown } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useNavigate } from 'react-router-dom';

interface OnboardingProgressGateProps {
  children: ReactNode;
  requiredLevel: number;
  featureName: string;
  featureDescription: string;
  unlockActions?: string[];
}

export const OnboardingProgressGate = ({ 
  children, 
  requiredLevel, 
  featureName, 
  featureDescription,
  unlockActions = []
}: OnboardingProgressGateProps) => {
  const { gamificationData: gamification } = useGamification();
  const navigate = useNavigate();
  
  const currentLevel = gamification?.current_level || 1;
  const currentXP = gamification?.total_xp || 0;
  const hasAccess = currentLevel >= requiredLevel;

  // XP thresholds for levels (simple progression)
  const getXPForLevel = (level: number) => Math.pow(level - 1, 2) * 100;
  const nextLevelXP = getXPForLevel(requiredLevel);
  const progressToRequired = Math.min((currentXP / nextLevelXP) * 100, 100);

  const getLevelIcon = (level: number) => {
    if (level <= 2) return <Star className="h-4 w-4" />;
    if (level <= 4) return <Zap className="h-4 w-4" />;
    return <Crown className="h-4 w-4" />;
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 4) return "bg-blue-500";
    return "bg-purple-500";
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Level {requiredLevel} Required
        </Badge>
      </div>
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getLevelIcon(requiredLevel)}
          {featureName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{featureDescription}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Level Progress</span>
            <span className="font-medium">
              Level {currentLevel} → Level {requiredLevel}
            </span>
          </div>
          
          <Progress value={progressToRequired} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentXP} XP</span>
            <span>{nextLevelXP} XP needed</span>
          </div>
        </div>

        {unlockActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick ways to unlock:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {unlockActions.map((action, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => navigate('/gamification')} className="flex-1">
            View Progress
          </Button>
          <Button variant="outline" onClick={() => navigate('/contacts')}>
            Start Building
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};