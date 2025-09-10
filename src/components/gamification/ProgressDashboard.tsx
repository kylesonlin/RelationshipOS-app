import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { useAnalytics } from "@/hooks/useAnalyticsData";
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  Sparkles,
  Activity,
  Award,
  Star,
  Zap
} from "lucide-react";

interface ProgressDashboardProps {
  className?: string;
}

export function ProgressDashboard({ className }: ProgressDashboardProps) {
  const { gamificationData, achievements, userAchievements, loading: gamLoading } = useGamification();
  const { analytics, loading: analyticsLoading } = useAnalytics();

  if (gamLoading || analyticsLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const earnedAchievementIds = new Set(userAchievements.map(a => a.id));
  const nextAchievements = achievements
    .filter(a => !earnedAchievementIds.has(a.id))
    .sort((a, b) => {
      // Sort by how close user is to achieving them
      const progressA = getProgressToAchievement(a);
      const progressB = getProgressToAchievement(b);
      return progressB - progressA;
    })
    .slice(0, 3);

  function getProgressToAchievement(achievement: any) {
    if (!gamificationData) return 0;

    switch (achievement.requirement_type) {
      case 'contacts':
        return Math.min(100, (gamificationData.total_contacts / achievement.requirement_value) * 100);
      case 'meetings':
        return Math.min(100, (gamificationData.total_meetings / achievement.requirement_value) * 100);
      case 'opportunities':
        return Math.min(100, (gamificationData.total_opportunities / achievement.requirement_value) * 100);
      case 'streak':
        return Math.min(100, (gamificationData.current_streak / achievement.requirement_value) * 100);
      case 'xp':
        return Math.min(100, (gamificationData.total_xp / achievement.requirement_value) * 100);
      default:
        return 0;
    }
  }

  function getCurrentValue(achievement: any) {
    if (!gamificationData) return 0;

    switch (achievement.requirement_type) {
      case 'contacts': return gamificationData.total_contacts;
      case 'meetings': return gamificationData.total_meetings;
      case 'opportunities': return gamificationData.total_opportunities;
      case 'streak': return gamificationData.current_streak;
      case 'xp': return gamificationData.total_xp;
      default: return 0;
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  // Weekly goals progress
  const weeklyProgress = gamificationData ? 
    (gamificationData.weekly_goal_progress / gamificationData.weekly_goal_target) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Your Progress Overview
          </CardTitle>
          <CardDescription>
            Track your networking journey and relationship building milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{gamificationData?.total_contacts || 0}</div>
              <div className="text-sm text-muted-foreground">Contacts</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{gamificationData?.total_meetings || 0}</div>
              <div className="text-sm text-muted-foreground">Meetings</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{gamificationData?.total_opportunities || 0}</div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{gamificationData?.current_streak || 0}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Weekly Goals
          </CardTitle>
          <CardDescription>
            Stay on track with your weekly networking targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Goal Progress</span>
              <span className="font-medium">
                {gamificationData?.weekly_goal_progress || 0} / {gamificationData?.weekly_goal_target || 5}
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <div className="text-xs text-muted-foreground">
              {weeklyProgress >= 100 ? 
                "🎉 Weekly goal achieved! Great work!" :
                `${Math.max(0, (gamificationData?.weekly_goal_target || 5) - (gamificationData?.weekly_goal_progress || 0))} more activities to reach your goal`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Next Achievements
          </CardTitle>
          <CardDescription>
            Your closest achievements based on current progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextAchievements.map(achievement => {
              const progress = getProgressToAchievement(achievement);
              const currentValue = getCurrentValue(achievement);
              
              return (
                <div key={achievement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {currentValue} / {achievement.requirement_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% complete
                      </span>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Sparkles className="h-3 w-3" />
                        <span>+{achievement.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Relationship Health */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Relationship Health
            </CardTitle>
            <CardDescription>
              Overview of your relationship portfolio strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {analytics.relationshipHealth.strong}
                </div>
                <div className="text-sm text-muted-foreground">Strong</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {analytics.relationshipHealth.warm}
                </div>
                <div className="text-sm text-muted-foreground">Warm</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {analytics.relationshipHealth.cold}
                </div>
                <div className="text-sm text-muted-foreground">Cold</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {analytics.relationshipHealth.declining}
                </div>
                <div className="text-sm text-muted-foreground">At Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}