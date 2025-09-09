import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Upload, 
  Calendar, 
  Mail, 
  Star,
  Zap,
  Target,
  Plus
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useNavigate } from "react-router-dom";

export const NetworkXPSystem = () => {
  const { gamificationData } = useGamification();
  const navigate = useNavigate();
  
  const currentXP = gamificationData?.total_xp || 0;
  const currentLevel = gamificationData?.current_level || 1;
  const nextLevelXP = currentLevel * 200; // 200, 400, 600, etc.
  const progressToNext = ((currentXP % 200) / 200) * 100;

  const xpActions = [
    {
      icon: Users,
      title: "Connect Google Calendar",
      description: "Sync your meetings for intelligent insights",
      xp: 100,
      completed: false, // This would be dynamic based on integration status
      action: () => navigate('/integrations')
    },
    {
      icon: Mail,
      title: "Connect Gmail",
      description: "Analyze communication patterns",
      xp: 100,
      completed: false,
      action: () => navigate('/integrations')
    },
    {
      icon: Upload,
      title: "Upload Phone Contacts",
      description: "Import your mobile contact list",
      xp: 200,
      completed: false,
      action: () => navigate('/contacts')
    },
    {
      icon: Calendar,
      title: "Complete First Meeting Prep",
      description: "Use AI to prepare for a meeting",
      xp: 50,
      completed: false,
      action: () => navigate('/meeting-prep')
    },
    {
      icon: Target,
      title: "Send 5 Follow-ups",
      description: "Use automation to reconnect",
      xp: 75,
      completed: false,
      action: () => navigate('/follow-up-automation')
    }
  ];

  const upcomingRewards = [
    {
      level: 4,
      xp: 500,
      reward: "LinkedIn Intelligence Suite",
      description: "Career tracking & social graph analysis"
    },
    {
      level: 5,
      xp: 1000,
      reward: "AI Referral Network",
      description: "Connect with other users' networks"
    },
    {
      level: 6,
      xp: 1500,
      reward: "Advanced Automation",
      description: "Smart sequences & relationship scoring"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Network Builder Level {currentLevel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress to Level {currentLevel + 1}</span>
            <span className="text-sm text-muted-foreground">{currentXP} / {nextLevelXP} XP</span>
          </div>
          <Progress value={progressToNext} className="h-3" />
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              {nextLevelXP - currentXP} XP until next unlock
            </span>
          </div>
        </CardContent>
      </Card>

      {/* XP Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Build Your Network
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete these actions to unlock powerful features
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {xpActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  action.completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-background border-border hover:border-primary/30 cursor-pointer'
                }`}
                onClick={!action.completed ? action.action : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      action.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        action.completed ? 'text-green-600 dark:text-green-400' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={action.completed ? "default" : "secondary"}>
                      +{action.xp} XP
                    </Badge>
                    {!action.completed && (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upcoming Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Upcoming Unlocks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingRewards.map((reward, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                currentXP >= reward.xp 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'border-dashed border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{reward.reward}</h4>
                    <Badge variant={currentXP >= reward.xp ? "default" : "outline"}>
                      Level {reward.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{reward.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{reward.xp} XP</div>
                  {currentXP < reward.xp && (
                    <div className="text-xs text-muted-foreground">
                      {reward.xp - currentXP} to go
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};