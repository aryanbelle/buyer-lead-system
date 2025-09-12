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
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function logout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(CURRENT_USER_KEY)
}

export function login(email: string): User | null {
  const user = demoUsers.find((u) => u.email === email)
  if (user) {
    setCurrentUser(user)
    return user
  }
  return null
}
