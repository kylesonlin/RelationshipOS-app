import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Eye, LogIn } from "lucide-react"

export const DemoModeIndicator = () => {
  const { isDemoUser, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isDemoUser) return null

  const handleSignIn = () => {
    localStorage.removeItem('demo-user')
    signOut()
    navigate('/auth')
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-2">
        <Eye className="h-3 w-3" />
        Demo Mode
      </Badge>
      <Button 
        onClick={handleSignIn}
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
      >
        <LogIn className="h-3 w-3" />
        Sign In
      </Button>
    </div>
  )
}