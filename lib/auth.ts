// Simple authentication system for demo purposes
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "agent"
}

const CURRENT_USER_KEY = "current-user"

// Demo users
export const demoUsers: User[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@company.com",
    role: "admin",
  },
  {
    id: "agent-1",
    name: "Sales Agent",
    email: "agent@company.com",
    role: "agent",
  },
]

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    // Server-side: check cookies
    try {
      const { cookies } = require('next/headers')
      const cookieStore = cookies()
      const userCookie = cookieStore.get('demo-user')
      return userCookie && userCookie.value ? JSON.parse(userCookie.value) : null
    } catch {
      return null
    }
  }

  // Client-side: check localStorage first, then fallback to cookie
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  
  // Fallback to cookie for client-side
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('demo-user='))
      ?.split('=')[1]
    
    if (cookieValue) {
      const user = JSON.parse(decodeURIComponent(cookieValue))
      // Sync to localStorage
      setCurrentUser(user)
      return user
    }
  } catch {
    // Ignore cookie parsing errors
  }
  
  return null
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function logout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(CURRENT_USER_KEY)
  
  // Also clear the cookie
  document.cookie = 'demo-user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

export function login(email: string): User | null {
  const user = demoUsers.find((u) => u.email === email)
  if (user) {
    // Set in localStorage for client-side access
    setCurrentUser(user)
    
    // Trigger a storage event manually for cross-tab synchronization
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'current-user',
          newValue: JSON.stringify(user),
          storageArea: localStorage
        }))
      } catch (error) {
        console.error('Error triggering storage event:', error)
      }
    }
    
    return user
  }
  return null
}
