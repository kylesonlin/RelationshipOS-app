import { useState } from "react"
import { RelationshipHealthScore } from "@/components/gamification/RelationshipHealthScore"
import { AchievementSystem } from "@/components/gamification/AchievementSystem"
import { StreakTracker } from "@/components/gamification/StreakTracker"
import { Leaderboard } from "@/components/gamification/Leaderboard"
import { ProgressChallenges } from "@/components/gamification/ProgressChallenges"
import { XPBar } from "@/components/gamification/XPBar"
import { LinkedInTeaser } from "@/components/gamification/LinkedInTeaser"
import { NetworkXPSystem } from "@/components/gamification/NetworkXPSystem"
import { useGamification } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Users, 
  Flame,
  Crown,
  Star,
  TrendingUp,
  Gift,
  Sparkles,
  Heart,
  Calendar,
  Award
} from "lucide-react"

export default function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { gamificationData, loading, getLevel, getHealthScoreLevel } = useGamification()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Relationship Achievements
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Level up your networking game! Track your progress, earn achievements, and compete with your team.
        </p>
      </div>

      {/* Quick Stats */}
      {loading || !gamificationData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-2 border-muted">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue/5">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">Level {getLevel(gamificationData.total_xp)}</div>
              <div className="text-sm text-muted-foreground">
                {getLevel(gamificationData.total_xp) >= 15 ? 'Relationship Master' : 
                 getLevel(gamificationData.total_xp) >= 10 ? 'Network Builder' : 
                 getLevel(gamificationData.total_xp) >= 5 ? 'Relationship Pro' : 'Networking Novice'}
              </div>
              <div className="mt-2">
                <Badge variant="default" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {gamificationData.total_xp.toLocaleString()} XP
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{gamificationData.current_streak} Days</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="mt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {gamificationData.current_streak >= 7 ? 'On Fire!' : 
                   gamificationData.current_streak >= 3 ? 'Building!' : 'Getting Started!'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">Score: {gamificationData.relationship_health_score}</div>
              <div className="text-sm text-muted-foreground">Health Score</div>
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  <Heart className="h-3 w-3 mr-1" />
                  {getHealthScoreLevel(gamificationData.relationship_health_score).level}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {gamificationData.weekly_goal_progress || 0}/{gamificationData.weekly_goal_target || 5}
              </div>
              <div className="text-sm text-muted-foreground">Weekly Progress</div>
              <div className="mt-2">
                <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {((gamificationData.weekly_goal_progress || 0) / (gamificationData.weekly_goal_target || 5) * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Trophy className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Crown className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <XPBar showDetails={true} />
              <LinkedInTeaser />
              <RelationshipHealthScore />
              <ProgressChallenges />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <StreakTracker />
              <NetworkXPSystem />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementSystem />
        </TabsContent>

        <TabsContent value="challenges">
          <ProgressChallenges />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RelationshipHealthScore />
            <StreakTracker />
          </div>
          <XPBar showDetails={true} />
        </TabsContent>
      </Tabs>

      {/* Motivational Footer */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Keep Building Those Relationships!</h2>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground mb-4">
            Every connection counts. Your next breakthrough relationship is just one conversation away.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Set Weekly Goal
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add New Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}