import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { useGamification } from "@/hooks/useGamification"
import { useSidebar } from "@/components/ui/sidebar"
import { 
  CheckCircle, 
  Crown, 
  Star, 
  Zap, 
  TrendingUp,
  Users,
  Calendar,
  Target,
  FileText,
  Mail,
  Phone,
  Upload,
  Settings,
  ArrowRight,
  Trophy,
  ChevronRight,
  Heart,
  Flame
} from "lucide-react"
import { WeeklyGoalTracker } from "@/components/gamification/WeeklyGoalTracker"

interface SmartTask {
  id: string
  title: string
  description: string
  category: 'profile' | 'import' | 'relationship' | 'feature'
  priority: 'high' | 'medium' | 'low'
  icon: React.ComponentType<any>
  xpReward: number
  action: string
  tier?: 'free' | 'personal' | 'business' | 'enterprise'
}

export function ProfileNavigationCard() {
  const { user } = useAuth()
  const { subscription, getCurrentPlan } = useSubscription()
  const { gamificationData, getHealthScoreLevel } = useGamification()
  const { state } = useSidebar()
  const navigate = useNavigate()
  const collapsed = state === "collapsed"
  
  // Mock profile completion data - in real app, calculate from user data
  const profileCompletion = 73
  const weeklyRank = 12

  // Get current plan details
  const currentPlan = getCurrentPlan()
  const planTier = currentPlan?.plan_id || (subscription?.is_trial ? 'trial' : 'free')
  
  // Smart task suggestions based on user tier and completion status
  const getSmartTasks = (): SmartTask[] => {
    const baseTasks: SmartTask[] = [
      {
        id: 'complete-profile',
        title: 'Complete Your Profile',
        description: 'Add bio, company info, and profile picture',
        category: 'profile',
        priority: 'high',
        icon: Settings,
        xpReward: 100,
        action: '/settings?tab=profile'
      },
      {
        id: 'import-contacts',
        title: 'Import 50 Contacts',
        description: 'Connect Gmail to import your contacts automatically',
        category: 'import',
        priority: 'high',
        icon: Upload,
        xpReward: 200,
        action: '/integrations'
      },
      {
        id: 'schedule-meeting',
        title: 'Schedule Your First Meeting',
        description: 'Connect calendar and schedule relationship building meetings',
        category: 'relationship',
        priority: 'medium',
        icon: Calendar,
        xpReward: 75,
        action: '/meeting-prep'
      }
    ]

    // Add tier-specific tasks
    if (planTier === 'free' || planTier === 'trial') {
      baseTasks.push({
        id: 'upgrade-account',
        title: 'Upgrade to Personal Pro',
        description: 'Unlock AI insights and advanced relationship analytics',
        category: 'feature',
        priority: 'medium',
        icon: Crown,
        xpReward: 0,
        action: '/billing',
        tier: 'free'
      })
    } else if (planTier === 'personal') {
      baseTasks.push({
        id: 'try-oracle',
        title: 'Ask the Oracle Engine',
        description: 'Get AI insights about your relationships',
        category: 'feature',
        priority: 'medium',
        icon: Zap,
        xpReward: 50,
        action: '/oracle'
      })
    } else if (planTier === 'business') {
      baseTasks.push({
        id: 'invite-team',
        title: 'Invite Team Members',
        description: 'Share contacts and collaborate with your team',
        category: 'relationship',
        priority: 'medium',
        icon: Users,
        xpReward: 150,
        action: '/team'
      })
    }

    // Sort by priority and return top 3-5
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return baseTasks
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, collapsed ? 2 : 4)
  }

  const getVerificationBadge = () => {
    const baseClasses = "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
    
    switch (planTier) {
      case 'trial':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Trial",
          className: `${baseClasses} bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200`,
          tooltip: `Upgrade to unlock premium features • ${subscription?.trial_end ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 12} days left in trial`,
          action: () => navigate('/billing')
        }
      case 'personal':
        return {
          icon: <CheckCircle className="h-3 w-3 fill-blue-500 text-white" />,
          text: "Pro",
          className: `${baseClasses} bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200`,
          tooltip: "Personal Pro Member • $99/month plan",
          action: () => navigate('/settings?tab=profile')
        }
      case 'business':
        return {
          icon: <Crown className="h-3 w-3 fill-yellow-500 text-white" />,
          text: "Business",
          className: `${baseClasses} bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border border-yellow-300 hover:shadow-glow transition-all`,
          tooltip: "Business Member • $299/month plan • Team features unlocked",
          action: () => navigate('/team')
        }
      case 'enterprise':
        return {
          icon: <Star className="h-3 w-3 fill-purple-500 text-white" />,
          text: "Enterprise",
          className: `${baseClasses} bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-300 hover:shadow-elegant transition-all`,
          tooltip: "Enterprise Member • $599/month plan • Full access unlocked",
          action: () => navigate('/admin')
        }
      default:
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Free",
          className: `${baseClasses} bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200`,
          tooltip: "Free Plan • Upgrade to unlock premium features",
          action: () => navigate('/billing')
        }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleTaskClick = (task: SmartTask) => {
    if (task.action.startsWith('/')) {
      navigate(task.action)
    }
  }

  const verificationBadge = getVerificationBadge()
  const smartTasks = getSmartTasks()
  const healthScore = getHealthScoreLevel(gamificationData?.relationship_health_score || 0)

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className="p-2">
          <Card className="border border-border/50 bg-card/95 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all animate-fade-in">
            <CardContent className="p-3 space-y-3">
              {/* Avatar with verification badge */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-background shadow-soft">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 border shadow-sm cursor-pointer hover:scale-110 transition-all duration-200 hover-scale"
                        onClick={verificationBadge.action}
                      >
                        <div className="transition-colors duration-200">
                          {verificationBadge.icon}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-48 z-50">
                      <p>{verificationBadge.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Condensed stats */}
                <div className="text-center space-y-1">
                  <div className="text-xs font-semibold bg-gradient-primary bg-clip-text text-transparent">
                    L{gamificationData?.current_level || 1}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500 animate-pulse" />
                    <span className="text-xs font-medium">{gamificationData?.current_streak || 0}</span>
                  </div>
                </div>
              </div>

              {/* Mini tasks */}
              <div className="space-y-1">
                {smartTasks.slice(0, 2).map((task, index) => (
                  <Tooltip key={task.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 p-1 justify-center hover:bg-accent/70 transition-all duration-200 hover-scale"
                        onClick={() => handleTaskClick(task)}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <task.icon className="h-3 w-3 transition-transform duration-200" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-48 z-50">
                      <div className="space-y-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        {task.xpReward > 0 && (
                          <p className="text-xs text-primary font-semibold">+{task.xpReward} XP</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="p-4">
        <Card className="border border-border/50 bg-card/95 backdrop-blur-sm shadow-elegant hover:shadow-glow transition-all duration-300 animate-fade-in">
          <CardContent className="p-4 space-y-4">
            {/* Profile Header */}
            <div className="space-y-3">
              {/* User Info with Verification Badge */}
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-medium">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {user?.user_metadata?.full_name || 'Your Name'}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`${verificationBadge.className} hover-scale`}
                        onClick={verificationBadge.action}
                      >
                        {verificationBadge.icon}
                        <span>{verificationBadge.text}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{verificationBadge.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Level {gamificationData?.current_level || 1} • <span className="bg-gradient-primary bg-clip-text text-transparent font-medium">{gamificationData?.total_xp || 0} XP</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2 bg-accent" />
            </div>

            {/* Key KPIs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-3 w-3 text-orange-500 animate-pulse" />
                  <span className="font-semibold">{gamificationData?.current_streak || 0}</span>
                </div>
                <div className="text-muted-foreground">Streak</div>
              </div>
              
              <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="font-semibold">#{weeklyRank}</span>
                </div>
                <div className="text-muted-foreground">Rank</div>
              </div>
              
              <div className="text-center p-2 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg border border-pink-200/50 dark:border-pink-800/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className={`h-3 w-3 ${healthScore.color}`} />
                  <span className="font-semibold">{gamificationData?.relationship_health_score || 0}%</span>
                </div>
                <div className="text-muted-foreground">Health</div>
              </div>
            </div>
          </div>

          {/* Smart Task Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Smart Suggestions</h4>
              <Badge variant="outline" className="text-xs">
                {smartTasks.length} tasks
              </Badge>
            </div>

            <div className="space-y-2">
              {smartTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-gradient-to-r from-background/50 to-accent/30 hover:from-accent/50 hover:to-accent/70 cursor-pointer transition-all duration-200 group hover-scale animate-fade-in"
                  onClick={() => handleTaskClick(task)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-gradient-primary shadow-soft group-hover:shadow-medium transition-all duration-200">
                      <task.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium truncate">{task.title}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    {task.xpReward > 0 && (
                      <p className="text-xs font-semibold bg-gradient-primary bg-clip-text text-transparent">+{task.xpReward} XP</p>
                    )}
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              ))}
            </div>

            {/* Weekly Goal Tracker */}
            {!collapsed && (
              <div className="mt-4">
                <WeeklyGoalTracker compact={true} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs hover-scale transition-all duration-200"
                onClick={() => navigate('/dashboard')}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Complete Tasks
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs hover-scale transition-all duration-200"
                onClick={() => navigate('/settings?tab=profile')}
              >
                <Settings className="h-3 w-3 mr-1" />
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  )
}