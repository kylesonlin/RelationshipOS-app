import { useGamification, Challenge } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  Calendar, 
  Users,
  MessageCircle,
  Trophy,
  Clock,
  Sparkles,
  CheckCircle,
  Gift
} from "lucide-react"
import * as LucideIcons from "lucide-react"

interface ProgressChallengesProps {
  className?: string
}

export function ProgressChallenges({ className }: ProgressChallengesProps) {
  const { activeChallenges, loading } = useGamification()

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || Target
    return IconComponent
  }

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'contacts': return Users
      case 'meetings': return Calendar
      case 'follow_ups': return MessageCircle
      default: return Target
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return "Less than 1h left"
  }

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100
    if (percentage >= 100) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-gray-600"
  }

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const IconComponent = getChallengeTypeIcon(challenge.challenge_type)
    const progress = (challenge.current_progress / challenge.target_value) * 100
    const isCompleted = challenge.completed
    const timeRemaining = getTimeRemaining(challenge.end_date)
    
    return (
      <Card className={`transition-all hover:shadow-md ${isCompleted ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-muted hover:border-primary/50'}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-foreground'}`}>
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
              </div>
              
              {isCompleted ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeRemaining}
                </Badge>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={`font-medium ${getProgressColor(challenge.current_progress, challenge.target_value)}`}>
                  {challenge.current_progress} / {challenge.target_value}
                </span>
              </div>
              <Progress value={Math.min(100, progress)} className="h-2" />
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">+{challenge.xp_reward} XP</span>
                </div>
                {challenge.badge_reward && (
                  <div className="flex items-center gap-1">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">Badge</span>
                  </div>
                )}
              </div>
              
              {!isCompleted && (
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedChallenges = activeChallenges.filter(c => c.completed)
  const activeChallengesList = activeChallenges.filter(c => !c.completed)

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Weekly Challenges
              </CardTitle>
              <CardDescription>
                Complete challenges to earn XP and unlock achievements
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {completedChallenges.length}/{activeChallenges.length}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {activeChallenges.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for new challenges to earn XP and rewards!
              </p>
              <Button variant="outline">
                Browse All Challenges
              </Button>
            </div>
          ) : (
            <>
              {/* Active Challenges */}
              {activeChallengesList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Active Challenges
                  </h3>
                  {activeChallengesList.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}

              {/* Completed Challenges */}
              {completedChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Completed This Week
                  </h3>
                  {completedChallenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              )}

              {/* Challenge Stats */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {activeChallenges.reduce((sum, c) => sum + c.xp_reward, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total XP Available</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {completedChallenges.reduce((sum, c) => sum + c.xp_reward, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">XP Earned</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {completedChallenges.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Challenges Won</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}