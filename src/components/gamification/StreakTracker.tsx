import { useGamification } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Flame, 
  Calendar, 
  TrendingUp,
  Zap,
  Target,
  Clock,
  Award
} from "lucide-react"

interface StreakTrackerProps {
  className?: string
}

export function StreakTracker({ className }: StreakTrackerProps) {
  const { gamificationData, loading } = useGamification()

  if (loading || !gamificationData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current_streak, longest_streak, last_activity_date } = gamificationData
  
  const getStreakLevel = () => {
    if (current_streak >= 100) return { level: 'Legendary', color: 'text-purple-600', bg: 'bg-purple-100', icon: Zap }
    if (current_streak >= 30) return { level: 'Master', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Award }
    if (current_streak >= 7) return { level: 'Consistent', color: 'text-blue-600', bg: 'bg-blue-100', icon: Target }
    if (current_streak >= 3) return { level: 'Building', color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp }
    return { level: 'Starting', color: 'text-gray-600', bg: 'bg-gray-100', icon: Calendar }
  }

  const getStreakMessage = () => {
    if (current_streak === 0) return "Start your relationship journey today!"
    if (current_streak === 1) return "Great start! Keep the momentum going!"
    if (current_streak < 7) return "Building a habit! You're doing great!"
    if (current_streak < 30) return "Consistent networking! You're on fire!"
    if (current_streak < 100) return "Master networker! Your dedication shows!"
    return "Legendary status! You're an inspiration!"
  }

  const getNextMilestone = () => {
    if (current_streak < 3) return 3
    if (current_streak < 7) return 7
    if (current_streak < 14) return 14
    if (current_streak < 30) return 30
    if (current_streak < 50) return 50
    if (current_streak < 100) return 100
    return Math.ceil(current_streak / 100) * 100 + 100
  }

  const isStreakActive = () => {
    if (!last_activity_date) return false
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return last_activity_date === today || last_activity_date === yesterday
  }

  const streakLevel = getStreakLevel()
  const IconComponent = streakLevel.icon
  const nextMilestone = getNextMilestone()
  const progressToMilestone = (current_streak / nextMilestone) * 100

  return (
    <Card className={`${className} border-2 ${isStreakActive() ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${streakLevel.bg}`}>
              <Flame className={`h-5 w-5 ${current_streak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Activity Streak</CardTitle>
              <CardDescription>Daily relationship building consistency</CardDescription>
            </div>
          </div>
          <Badge 
            variant={isStreakActive() ? "default" : "outline"} 
            className={`${streakLevel.color} ${isStreakActive() ? 'animate-pulse' : ''}`}
          >
            <IconComponent className="h-3 w-3 mr-1" />
            {streakLevel.level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {current_streak}
            </div>
            {current_streak > 0 && (
              <div className="text-orange-500 animate-bounce">
                <Flame className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {current_streak === 1 ? 'day streak' : 'days streak'}
          </div>
        </div>

        {/* Progress to Next Milestone */}
        {current_streak < nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next milestone: {nextMilestone} days</span>
              <span className="text-orange-600 font-medium">
                {nextMilestone - current_streak} to go
              </span>
            </div>
            <Progress value={progressToMilestone} className="h-2" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold text-primary">{current_streak}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{longest_streak}</div>
            <div className="text-xs text-muted-foreground">Best Ever</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className={`p-3 rounded-lg border ${isStreakActive() ? 'bg-orange-50 border-orange-200' : 'bg-muted/50 border-muted'}`}>
          <div className="flex items-center gap-2">
            <div className={isStreakActive() ? 'text-orange-600' : 'text-muted-foreground'}>
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">
              {getStreakMessage()}
            </span>
          </div>
        </div>

        {/* Last Activity */}
        {last_activity_date && (
          <div className="text-center text-xs text-muted-foreground">
            Last activity: {new Date(last_activity_date).toLocaleDateString()}
          </div>
        )}

        {/* Streak Milestones */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Streak Milestones</div>
          <div className="grid grid-cols-4 gap-1">
            {[3, 7, 30, 100].map(milestone => (
              <div 
                key={milestone}
                className={`text-center p-2 rounded transition-all ${
                  current_streak >= milestone 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-xs font-bold">{milestone}</div>
                <div className="text-[10px]">days</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {!isStreakActive() && (
          <Button className="w-full" variant="outline">
            <Flame className="h-4 w-4 mr-2" />
            Continue Streak
          </Button>
        )}
      </CardContent>
    </Card>
  )
}