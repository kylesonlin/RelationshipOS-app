import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Crown, 
  Medal, 
  Target,
  TrendingUp,
  Users,
  Sparkles,
  Calendar
} from "lucide-react"

interface LeaderboardEntry {
  user_id: string
  rank_position: number
  total_xp: number
  weekly_xp: number
  monthly_xp: number
  user_name?: string
  team_name?: string
}

interface LeaderboardProps {
  className?: string
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([])
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardEntry[]>([])
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<{ weekly: number; monthly: number; allTime: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      // Generate mock leaderboard data since we don't have actual user data yet
      const mockUsers = [
        { name: "Sarah Chen", team: "Sales" },
        { name: "Mike Rodriguez", team: "Marketing" },
        { name: "Emily Parker", team: "Sales" },
        { name: "David Kim", team: "Business Dev" },
        { name: "Lisa Thompson", team: "Marketing" },
        { name: "Alex Johnson", team: "Sales" },
        { name: "Rachel Martinez", team: "Business Dev" },
        { name: "Tom Wilson", team: "Marketing" },
        { name: "Jennifer Davis", team: "Sales" },
        { name: "Chris Anderson", team: "Business Dev" }
      ]

      const generateLeaderboard = (baseXP: number, variance: number) => 
        mockUsers.map((user, index) => ({
          user_id: `user_${index + 1}`,
          rank_position: index + 1,
          total_xp: baseXP - (index * 50) + Math.random() * variance,
          weekly_xp: Math.floor(Math.random() * 500) + 100,
          monthly_xp: Math.floor(Math.random() * 2000) + 500,
          user_name: user.name,
          team_name: user.team
        })).sort((a, b) => b.total_xp - a.total_xp)

      const weeklyData = generateLeaderboard(2500, 200)
      const monthlyData = generateLeaderboard(5000, 500)
      const allTimeData = generateLeaderboard(10000, 1000)

      setWeeklyLeaders(weeklyData)
      setMonthlyLeaders(monthlyData)
      setAllTimeLeaders(allTimeData)

      // Mock current user rank
      setUserRank({
        weekly: Math.floor(Math.random() * 10) + 5,
        monthly: Math.floor(Math.random() * 15) + 8,
        allTime: Math.floor(Math.random() * 20) + 12
      })

    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Trophy className="h-5 w-5 text-amber-600" />
      default: return <span className="text-sm font-bold text-muted-foreground">#{position}</span>
    }
  }

  const getRankBadgeVariant = (position: number) => {
    if (position <= 3) return "default"
    if (position <= 10) return "secondary"
    return "outline"
  }

  const getTeamColor = (team: string) => {
    const colors = {
      "Sales": "bg-blue-100 text-blue-700",
      "Marketing": "bg-purple-100 text-purple-700",
      "Business Dev": "bg-green-100 text-green-700"
    }
    return colors[team as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const LeaderboardTable = ({ 
    data, 
    scoreKey, 
    title 
  }: { 
    data: LeaderboardEntry[]
    scoreKey: 'weekly_xp' | 'monthly_xp' | 'total_xp'
    title: string 
  }) => (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.slice(0, 3).map((entry, index) => {
          const positions = [1, 0, 2] // Second place in middle
          const actualIndex = positions[index]
          const actualEntry = data[actualIndex]
          
          return (
            <div 
              key={actualEntry.user_id}
              className={`text-center p-4 rounded-lg border-2 ${
                actualIndex === 0 
                  ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
                  : actualIndex === 1
                  ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50'
                  : 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'
              } ${index === 1 ? 'transform scale-110' : ''}`}
            >
              <div className="flex justify-center mb-2">
                {getRankIcon(actualEntry.rank_position)}
              </div>
              <div className="text-sm font-medium truncate">
                {actualEntry.user_name}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {actualEntry.team_name}
              </div>
              <div className="text-lg font-bold text-primary">
                {Math.floor(actualEntry[scoreKey]).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          )
        })}
      </div>

      {/* Rest of the leaderboard */}
      <div className="space-y-2">
        {data.slice(3, 10).map((entry) => (
          <div 
            key={entry.user_id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(entry.rank_position)}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {entry.user_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{entry.user_name}</div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getTeamColor(entry.team_name || '')}`}
                >
                  {entry.team_name}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">
                {Math.floor(entry[scoreKey]).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded flex-1"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Team Leaderboard
              </CardTitle>
              <CardDescription>
                Compete with your team and climb the rankings
              </CardDescription>
            </div>
            
            {userRank && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Your Rank</div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-bold">#{userRank.weekly}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="weekly" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                This Week
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <Calendar className="h-4 w-4" />
                This Month
              </TabsTrigger>
              <TabsTrigger value="alltime" className="gap-2">
                <Crown className="h-4 w-4" />
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <LeaderboardTable 
                data={weeklyLeaders}
                scoreKey="weekly_xp"
                title="Weekly Champions"
              />
            </TabsContent>

            <TabsContent value="monthly">
              <LeaderboardTable 
                data={monthlyLeaders}
                scoreKey="monthly_xp"
                title="Monthly Leaders"
              />
            </TabsContent>

            <TabsContent value="alltime">
              <LeaderboardTable 
                data={allTimeLeaders}
                scoreKey="total_xp"
                title="All-Time Legends"
              />
            </TabsContent>
          </Tabs>

          {/* Team Stats */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Team Performance</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">Sales</div>
                <div className="text-muted-foreground">3,240 XP avg</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">Marketing</div>
                <div className="text-muted-foreground">2,890 XP avg</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">Business Dev</div>
                <div className="text-muted-foreground">3,100 XP avg</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
