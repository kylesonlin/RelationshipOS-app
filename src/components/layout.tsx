import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 md:h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shadow-soft flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <SidebarTrigger />
              
              {/* Search - hidden on mobile, shown on tablet+ */}
              <div className="relative max-w-md w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search contacts, tasks..." 
                  className="pl-10 bg-background text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Search button for mobile */}
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-gradient-primary">
                    <span className="text-white font-medium text-sm">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}