"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  login: (user: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for existing user on mount
    const checkUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking current user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkUser, 10)
    return () => clearTimeout(timer)
  }, [])

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    if (!mounted) return
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-user') {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [mounted])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
    window.location.href = "/login"
  }, [])

  const handleLogin = useCallback(async (user: User) => {
    try {
      // Update state immediately
      setUser(user)
      
      // Force a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [])

  // Don't render children until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, isLoading: true, logout: handleLogout, login: handleLogin }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout: handleLogout, login: handleLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
