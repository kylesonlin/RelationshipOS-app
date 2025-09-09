import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGamification } from "@/hooks/useGamification"
import { Target, TrendingUp, CheckCircle2, Calendar } from "lucide-react"

interface WeeklyGoalTrackerProps {
  compact?: boolean
}

export function WeeklyGoalTracker({ compact = false }: WeeklyGoalTrackerProps) {
  const { gamificationData } = useGamification()
  const [weeklyGoal, setWeeklyGoal] = useState(5) // Default goal
  const [currentProgress, setCurrentProgress] = useState(3) // Mock progress

  // Mock weekly activities - in real app, fetch from database
  const weeklyActivities = [
    { day: 'Mon', completed: true, activity: 'Added 2 contacts' },
    { day: 'Tue', completed: true, activity: 'Scheduled meeting' },
    { day: 'Wed', completed: true, activity: 'Follow-up emails' },
    { day: 'Thu', completed: false, activity: 'Planned' },
    { day: 'Fri', completed: false, activity: 'Planned' },
  ]

  const progressPercentage = Math.min((currentProgress / weeklyGoal) * 100, 100)
  const isOnTrack = currentProgress >= Math.ceil(weeklyGoal * 0.6) // 60% threshold
  const daysLeft = 7 - new Date().getDay()

  if (compact) {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium">Weekly Goal</span>
          </div>
          <Badge variant={isOnTrack ? "default" : "outline"} className="text-xs">
            {currentProgress}/{weeklyGoal}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-2" />
        <div className="text-xs text-muted-foreground">
          {isOnTrack ? (
            <span className="text-green-600 font-medium">On track! 🎯</span>
          ) : (
            <span className="text-amber-600 font-medium">{daysLeft} days left</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="border border-border/50 bg-card/95">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Goal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">This Week's Progress</span>
            <div className="flex items-center gap-2">
              <Badge variant={isOnTrack ? "default" : "outline"} className="text-xs">
                {currentProgress}/{weeklyGoal} activities
              </Badge>
              {isOnTrack && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-3" />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
            <span className={`font-medium ${isOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
              {isOnTrack ? 'On track!' : `${daysLeft} days left`}
            </span>
          </div>
        </div>

        {/* Daily Activities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Week
          </h4>
          <div className="grid grid-cols-5 gap-1">
            {weeklyActivities.map((day, index) => (
              <div 
                key={day.day}
                className={`p-2 rounded-md text-center transition-all ${
                  day.completed 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                <div className="text-xs font-medium">{day.day}</div>
                {day.completed && <CheckCircle2 className="h-3 w-3 mx-auto mt-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Update Goal
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Log Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}