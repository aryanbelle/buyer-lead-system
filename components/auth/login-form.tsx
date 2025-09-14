"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { login, demoUsers } from "@/lib/auth"
import { loginAction } from "@/app/actions/auth"
import { Users, Mail, Loader2, Check } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = login(email)
      if (user) {
        // Wait for server action to complete first
        await loginAction(user)
        // Add a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push("/buyers")
      } else {
        setError("Invalid email address. Please use one of the demo accounts.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setIsLoading(true)
    setError("")
    
    try {
      const user = login(demoEmail)
      if (user) {
        // Wait for server action to complete first
        await loginAction(user)
        // Add a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push("/buyers")
      }
    } catch (err) {
      console.error("Demo login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Modern Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative overflow-hidden">
        {/* Geometric Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/40 rounded-full translate-x-20 translate-y-20"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-100/20 rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-slate-800">
          <div className="max-w-md">
            {/* Logo Section */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Buyer Lead System</h1>
                  <p className="text-slate-600 text-base">Professional CRM Solution</p>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
                  Streamline Your Real Estate Business
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Take control of your property leads with intelligent management tools designed for modern real estate professionals.
                </p>
              </div>
              
              {/* Feature List */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Smart Lead Management</h3>
                    <p className="text-slate-600 text-sm">Track and organize your buyer leads with advanced filtering and search capabilities.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Role-Based Access</h3>
                    <p className="text-slate-600 text-sm">Secure access controls for admins and agents with customized permissions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Real-Time Updates</h3>
                    <p className="text-slate-600 text-sm">Stay synchronized across all devices with instant data updates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand - Mobile Only */}
          <div className="flex flex-col items-center space-y-3 lg:hidden">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Buyer Lead System</h1>
            <p className="text-base text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Login Form Content */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-center lg:text-left">Welcome back</h2>
            <p className="text-base text-muted-foreground text-center lg:text-left">
              Enter your email to sign in to your account
            </p>
          </div>
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm font-medium text-center mb-3">Demo Accounts</div>
              {demoUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-accent"
                  onClick={() => handleDemoLogin(user.email)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                      {user.role}
                    </Badge>
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
