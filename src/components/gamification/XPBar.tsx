import { useGamification } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Sparkles, 
  TrendingUp,
  ArrowUp,
  Target,
  Zap
} from "lucide-react"

interface XPBarProps {
  className?: string
  showDetails?: boolean
}

export function XPBar({ className, showDetails = true }: XPBarProps) {
  const { gamificationData, loading, getLevel, getXPForNextLevel, getXPProgress } = useGamification()

  if (loading || !gamificationData) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentLevel = getLevel(gamificationData.total_xp)
  const xpProgress = getXPProgress(gamificationData.total_xp)
  const xpForNext = getXPForNextLevel(gamificationData.total_xp)
  const currentLevelXP = gamificationData.total_xp % 1000

  const getLevelTitle = (level: number) => {
    if (level >= 50) return "Networking Legend"
    if (level >= 25) return "Relationship Master"
    if (level >= 15) return "Connection Expert"
    if (level >= 10) return "Network Builder"
    if (level >= 5) return "Relationship Pro"
    return "Networking Novice"
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return "text-purple-600"
    if (level >= 25) return "text-yellow-600"
    if (level >= 15) return "text-blue-600"
    if (level >= 10) return "text-green-600"
    if (level >= 5) return "text-orange-600"
    return "text-gray-600"
  }

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 25) return "default"
    if (level >= 10) return "secondary"
    return "outline"
  }

  return (
    <Card className={`${className} border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Level {currentLevel}
                <Badge variant={getLevelBadgeVariant(currentLevel)} className={getLevelColor(currentLevel)}>
                  {getLevelTitle(currentLevel)}
                </Badge>
              </CardTitle>
              {showDetails && (
                <CardDescription>
                  {gamificationData.total_xp.toLocaleString()} total XP earned
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {gamificationData.total_xp.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Experience Points</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
            <span className="text-primary font-medium">
              {currentLevelXP} / 1000 XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {currentLevel}</span>
            <span>{xpForNext} XP to go</span>
            <span>Level {currentLevel + 1}</span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* XP Breakdown */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="text-center p-2 bg-primary/5 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {Math.floor(gamificationData.total_xp * 0.4)}
                </div>
                <div className="text-xs text-muted-foreground">Contacts</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {Math.floor(gamificationData.total_xp * 0.35)}
                </div>
                <div className="text-xs text-muted-foreground">Meetings</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.floor(gamificationData.total_xp * 0.25)}
                </div>
                <div className="text-xs text-muted-foreground">Activities</div>
              </div>
            </div>

            {/* Level Benefits */}
            <div className="bg-gradient-to-r from-primary/10 to-purple/10 p-3 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Level {currentLevel} Benefits</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {currentLevel >= 5 && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-500" />
                    <span>Advanced analytics unlocked</span>
                  </div>
                )}
                {currentLevel >= 10 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span>Custom relationship goals</span>
                  </div>
                )}
                {currentLevel >= 15 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-purple-500" />
                    <span>Priority customer support</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Level Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next Level Rewards</span>
                <Badge variant="outline" className="text-xs">
                  Level {currentLevel + 1}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Unlock new features and earn bonus XP multipliers!
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <ArrowUp className="h-3 w-3 mr-2" />
                {xpForNext} XP to Level Up
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}