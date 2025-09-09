import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Linkedin, 
  Users, 
  TrendingUp, 
  Zap,
  Star,
  MapPin,
  Briefcase
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

export const LinkedInTeaser = () => {
  const { gamificationData } = useGamification();
  
  const currentXP = gamificationData?.total_xp || 0;
  const requiredXP = 500; // Level 4 requirement
  const progressPercentage = Math.min((currentXP / requiredXP) * 100, 100);
  const isUnlocked = currentXP >= requiredXP;

  const linkedInFeatures = [
    {
      icon: Users,
      title: "Social Graph Analysis",
      description: "Map your entire network and discover hidden connections"
    },
    {
      icon: TrendingUp,
      title: "Career Change Detection",
      description: "Get notified when contacts switch jobs or get promoted"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Know when connections are traveling to your city"
    },
    {
      icon: Briefcase,
      title: "Industry Network Mapping",
      description: "Visualize industry clusters and identify key influencers"
    }
  ];

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30' 
        : 'border-dashed border-primary/30 bg-primary/5'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            LinkedIn Intelligence Suite
            {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <Badge variant={isUnlocked ? "default" : "secondary"}>
            {isUnlocked ? "Unlocked!" : "Level 4"}
          </Badge>
        </div>
        {!isUnlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to unlock:</span>
              <span>{currentXP} / {requiredXP} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {linkedInFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isUnlocked 
                    ? 'bg-background border-border' 
                    : 'bg-muted/30 border-dashed border-muted-foreground/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    isUnlocked ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isUnlocked ? (
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Linkedin className="h-4 w-4 mr-2" />
            Connect LinkedIn Account
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Earn {requiredXP - currentXP} more XP to unlock LinkedIn features
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                +100 XP: Connect Google
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                +200 XP: Upload contacts
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};