import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  
  // Debug logging
  console.log('Header - User:', user)
  console.log('Header - Logout function:', typeof logout)
  
  if (!user) return null

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="text-xs">
            Admin
          </Badge>
        )
      case "agent":
        return (
          <Badge variant="secondary" className="text-xs">
            Agent
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Buyer Lead System</h1>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {/* Simple Logout Button - Fallback */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log('Simple logout clicked!')
              logout()
            }}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-muted hover:border-primary">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" sideOffset={4}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">{user.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  console.log('Logout clicked!')
                  e.preventDefault()
                  logout()
                }}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
