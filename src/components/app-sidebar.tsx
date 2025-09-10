import { 
  Command,
  Users, 
  Brain, 
  TrendingUp, 
  Settings,
  Zap,
  Puzzle,
  Trophy,
  Shield,
  Calendar,
  Clock
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { ProfileNavigationCard } from "@/components/ProfileNavigationCard"
import logoImage from "@/assets/relationshipos-logo.png"

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

// Executive AI Command Center Navigation
const commandItems = [
  { title: "AI Command Center", url: "/", icon: Command },
  { title: "Relationship Intelligence", url: "/contacts", icon: Users },
  { title: "AI Strategy Assistant", url: "/oracle", icon: Brain },
  { title: "Executive Intelligence", url: "/analytics", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
]

// Intelligence Tools
const intelligenceItems = [
  { title: "Data Intelligence Hub", url: "/integrations", icon: Puzzle },
  { title: "Meeting Intelligence", url: "/meeting-prep", icon: Calendar },
  { title: "Automation Engine", url: "/follow-up-automation", icon: Zap },
]

// Professional Growth (subtle placement)
const growthItems = [
  { title: "Professional Growth", url: "/gamification-dashboard", icon: Trophy },
  { title: "Security Dashboard", url: "/admin-dashboard", icon: Shield },
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
    return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
      active 
        ? "executive-card-premium text-primary font-semibold shadow-executive" 
        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-soft"
    }`
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r bg-card transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Executive Brand */}
        <div className="p-6 border-b border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center executive-card-premium">
                <img src={logoImage} alt="RelationshipOS" className="h-6 w-6" />
              </div>
              <div>
                <div className="executive-title text-lg">RelationshipOS</div>
                <div className="text-xs text-muted-foreground">Executive Command Center</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center executive-card-premium">
                <img src={logoImage} alt="RelationshipOS" className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Executive Command Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {commandItems.map((item) => (
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

          {/* Intelligence Tools - Show only when expanded */}
          {!collapsed && (
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs text-muted-foreground font-medium">Intelligence Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {intelligenceItems.map((item) => (
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

          {/* Professional Growth - Show only when expanded */}
          {!collapsed && (
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs text-muted-foreground font-medium">Professional</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {growthItems.map((item) => (
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