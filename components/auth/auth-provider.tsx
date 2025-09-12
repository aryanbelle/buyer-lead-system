"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, logout, type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
  login: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = "/login"
  }

  const handleLogin = (user: User) => {
    setUser(user)
  }

  return <AuthContext.Provider value={{ user, isLoading, logout: handleLogout, login: handleLogin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
