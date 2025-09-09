import { useState } from "react"
import { RelationshipHealthScore } from "@/components/gamification/RelationshipHealthScore"
import { AchievementSystem } from "@/components/gamification/AchievementSystem"
import { StreakTracker } from "@/components/gamification/StreakTracker"
import { Leaderboard } from "@/components/gamification/Leaderboard"
import { ProgressChallenges } from "@/components/gamification/ProgressChallenges"
import { XPBar } from "@/components/gamification/XPBar"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue/5">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">Level 12</div>
            <div className="text-sm text-muted-foreground">Relationship Pro</div>
            <div className="mt-2">
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                2,400 XP
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">15 Days</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
            <div className="mt-2">
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                On Fire!
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">Score: 78</div>
            <div className="text-sm text-muted-foreground">Health Score</div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Gold Tier
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">Rank #8</div>
            <div className="text-sm text-muted-foreground">This Week</div>
            <div className="mt-2">
              <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Rising
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <RelationshipHealthScore />
              <ProgressChallenges />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <StreakTracker />
              
              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Contact Collector</div>
                      <div className="text-xs text-muted-foreground">Reached 50 contacts</div>
                    </div>
                    <Badge variant="default" className="text-xs">+250 XP</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Meeting Marathon</div>
                      <div className="text-xs text-muted-foreground">Completed 25 meetings</div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">+300 XP</Badge>
                  </div>

                  <Button variant="outline" className="w-full text-sm">
                    <Gift className="h-4 w-4 mr-2" />
                    View All Achievements
                  </Button>
                </CardContent>
              </Card>
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