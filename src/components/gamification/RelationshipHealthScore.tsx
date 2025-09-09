import { useGamification } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Crown, 
  Star, 
  Sparkles,
  TrendingUp,
  Heart
} from "lucide-react"

interface RelationshipHealthScoreProps {
  className?: string
}

export function RelationshipHealthScore({ className }: RelationshipHealthScoreProps) {
  const { gamificationData, loading, getHealthScoreLevel } = useGamification()

  if (loading || !gamificationData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthScore = gamificationData.relationship_health_score
  const healthLevel = getHealthScoreLevel(healthScore)
  
  const getScoreIcon = () => {
    switch (healthLevel.level) {
      case 'Platinum': return <Crown className="h-6 w-6 text-purple-500" />
      case 'Gold': return <Trophy className="h-6 w-6 text-yellow-500" />
      case 'Silver': return <Star className="h-6 w-6 text-gray-500" />
      default: return <TrendingUp className="h-6 w-6 text-amber-600" />
    }
  }

  const getMotivationalMessage = () => {
    if (healthScore >= 90) return "Exceptional relationship management! You're a networking master!"
    if (healthScore >= 75) return "Great work! Your relationships are thriving!"
    if (healthScore >= 60) return "Good progress! Keep nurturing those connections!"
    if (healthScore >= 40) return "Building momentum! Your network is growing!"
    return "Getting started! Every connection counts!"
  }

  const getNextLevelTarget = () => {
    if (healthScore < 60) return 60
    if (healthScore < 75) return 75
    if (healthScore < 90) return 90
    return 100
  }

  return (
    <Card className={`${className} border-2 ${healthLevel.level === 'Platinum' ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : healthLevel.level === 'Gold' ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${healthLevel.bg}`}>
              <Heart className={`h-5 w-5 ${healthLevel.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Relationship Health</CardTitle>
              <CardDescription>Your overall networking performance</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {getScoreIcon()}
              <Badge 
                variant="outline" 
                className={`${healthLevel.color} border-current`}
              >
                {healthLevel.level}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {healthScore}
          </div>
          <div className="text-sm text-muted-foreground">
            out of 100 points
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to {healthLevel.level === 'Platinum' ? 'Master' : getNextLevelTarget()}</span>
            <span className={healthLevel.color}>
              {healthScore >= 90 ? '100%' : `${Math.round((healthScore / getNextLevelTarget()) * 100)}%`}
            </span>
          </div>
          <Progress 
            value={healthScore >= 90 ? 100 : (healthScore / getNextLevelTarget()) * 100} 
            className="h-3"
          />
        </div>

        {/* Level Indicators */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <div className={`text-center p-2 rounded-lg transition-all ${healthScore >= 25 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
            <TrendingUp className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Bronze</div>
            <div className="text-xs">25+</div>
          </div>
          <div className={`text-center p-2 rounded-lg transition-all ${healthScore >= 60 ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400'}`}>
            <Star className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Silver</div>
            <div className="text-xs">60+</div>
          </div>
          <div className={`text-center p-2 rounded-lg transition-all ${healthScore >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-400'}`}>
            <Trophy className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Gold</div>
            <div className="text-xs">75+</div>
          </div>
          <div className={`text-center p-2 rounded-lg transition-all ${healthScore >= 90 ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
            <Crown className="h-4 w-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Platinum</div>
            <div className="text-xs">90+</div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getMotivationalMessage()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{gamificationData.total_contacts}</div>
            <div className="text-xs text-muted-foreground">Contacts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{gamificationData.total_meetings}</div>
            <div className="text-xs text-muted-foreground">Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{gamificationData.current_streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}