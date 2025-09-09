import { 
  Home, 
  Users, 
  Brain, 
  BarChart3, 
  Settings,
  Plus,
  Calendar,
  Clock,
  Target,
  Zap,
  Puzzle,
  Trophy,
  Share2,
  DollarSign,
  Headphones
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { ProfileNavigationCard } from "@/components/ProfileNavigationCard"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// Simplified 5-section navigation focused on user workflows
const primaryItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "People", url: "/contacts", icon: Users },
  { title: "Assistant", url: "/oracle", icon: Brain },
  { title: "Insights", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
]

// Quick access items that appear in collapsed mode or as secondary actions
const quickAccessItems = [
  { title: "Meeting Prep", url: "/meeting-prep", icon: Calendar },
  { title: "Time Tracking", url: "/time-tracking", icon: Clock },
  { title: "Automation", url: "/follow-up-automation", icon: Zap },
]

// Tools & Features - Built-out functionality
const toolsItems = [
  { title: "Integrations", url: "/integrations", icon: Puzzle },
  { title: "Team Sharing", url: "/team-sharing", icon: Share2 },
  { title: "Achievements", url: "/gamification-dashboard", icon: Trophy },
  { title: "ROI Analytics", url: "/roi-dashboard", icon: Target },
  { title: "Billing", url: "/billing-dashboard", icon: DollarSign },
  { title: "Support", url: "/support", icon: Headphones },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavClass = (path: string) => {
    const active = isActive(path)
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      active 
        ? "bg-primary text-primary-foreground shadow-soft font-medium" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r bg-card transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-lg">RelationshipOS</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Primary Navigation - Always visible */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {primaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Quick Access - Show only when expanded */}
          {!collapsed && (
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs text-muted-foreground">Quick Access</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {quickAccessItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClass(item.url)}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Tools & Features - Show only when expanded */}
          {!collapsed && (
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs text-muted-foreground">Tools & Features</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {toolsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClass(item.url)}>
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Profile Navigation Card - pushed to bottom */}
        <div className="mt-auto">
          <ProfileNavigationCard />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}