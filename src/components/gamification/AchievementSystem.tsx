import { useGamification, Achievement } from "@/hooks/useGamification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Crown, 
  Star, 
  Users,
  Calendar,
  Target,
  Sparkles,
  Lock,
  CheckCircle,
  Award
} from "lucide-react"
import * as LucideIcons from "lucide-react"

interface AchievementSystemProps {
  className?: string
}

export function AchievementSystem({ className }: AchievementSystemProps) {
  const { 
    achievements, 
    userAchievements, 
    gamificationData, 
    loading, 
    getTierColor 
  } = useGamification()

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const earnedAchievementIds = new Set(userAchievements.map(a => a.id))
  const earnedAchievements = achievements.filter(a => earnedAchievementIds.has(a.id))
  const availableAchievements = achievements.filter(a => !earnedAchievementIds.has(a.id))

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || Trophy
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="h-4 w-4" />
      case 'gold': return <Trophy className="h-4 w-4" />
      case 'silver': return <Star className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getProgressToAchievement = (achievement: Achievement) => {
    if (!gamificationData) return 0

    switch (achievement.requirement_type) {
      case 'contacts':
        return Math.min(100, (gamificationData.total_contacts / achievement.requirement_value) * 100)
      case 'meetings':
        return Math.min(100, (gamificationData.total_meetings / achievement.requirement_value) * 100)
      case 'opportunities':
        return Math.min(100, (gamificationData.total_opportunities / achievement.requirement_value) * 100)
      case 'streak':
        return Math.min(100, (gamificationData.current_streak / achievement.requirement_value) * 100)
      case 'xp':
        return Math.min(100, (gamificationData.total_xp / achievement.requirement_value) * 100)
      default:
        return 0
    }
  }

  const getCurrentValue = (achievement: Achievement) => {
    if (!gamificationData) return 0

    switch (achievement.requirement_type) {
      case 'contacts': return gamificationData.total_contacts
      case 'meetings': return gamificationData.total_meetings
      case 'opportunities': return gamificationData.total_opportunities
      case 'streak': return gamificationData.current_streak
      case 'xp': return gamificationData.total_xp
      default: return 0
    }
  }

  const AchievementCard = ({ achievement, earned }: { achievement: Achievement, earned: boolean }) => {
    const IconComponent = getIconComponent(achievement.badge_icon)
    const progress = getProgressToAchievement(achievement)
    const currentValue = getCurrentValue(achievement)

    return (
      <Card className={`relative transition-all hover:shadow-md ${earned ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10' : 'border-muted hover:border-primary/50'}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1">
                {getTierIcon(achievement.tier)}
                <Badge variant={earned ? "default" : "outline"} className={`${getTierColor(achievement.tier)} text-xs`}>
                  {achievement.tier}
                </Badge>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <h3 className={`font-semibold ${earned ? 'text-primary' : 'text-foreground'}`}>
                {achievement.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
            </div>

            {/* Progress or Status */}
            {earned ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Completed!</span>
                {achievement.earned_at && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(achievement.earned_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary">
                    {currentValue} / {achievement.requirement_value}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* XP Reward */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <span className="text-muted-foreground">+{achievement.xp_reward} XP</span>
              </div>
              {earned && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Earned
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs defaultValue="earned" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Achievement System</h2>
            <p className="text-muted-foreground">
              Unlock badges and earn XP by reaching relationship milestones
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-medium">{earnedAchievements.length}</span>
              <span className="text-muted-foreground">earned</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{availableAchievements.length}</span>
              <span className="text-muted-foreground">available</span>
            </div>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">
            Earned ({earnedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned">
          {earnedAchievements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building relationships to earn your first achievement!
                </p>
                <Button>View Available Achievements</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map(achievement => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  earned={true} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                earned={false} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
              const tierAchievements = achievements.filter(a => a.tier === tier)
              if (tierAchievements.length === 0) return null

              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-4">
                    {getTierIcon(tier)}
                    <h3 className={`text-lg font-semibold capitalize ${getTierColor(tier)}`}>
                      {tier} Achievements
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {tierAchievements.filter(a => earnedAchievementIds.has(a.id)).length} / {tierAchievements.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tierAchievements.map(achievement => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        earned={earnedAchievementIds.has(achievement.id)} 
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}