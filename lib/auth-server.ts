import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "agent"
}

// Demo users for cookie-based auth
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

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const userCookie = cookieStore.get('user')
  
  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch {
    return null
  }
}

// Set user cookie (server action)
export async function setUserCookie(user: User) {
  const cookieStore = cookies()
  cookieStore.set('user', JSON.stringify(user), {
    httpOnly: false, // Allow client access for compatibility
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

// Remove user cookie
export async function clearUserCookie() {
  const cookieStore = cookies()
  cookieStore.delete('user')
}

// Login with demo user
export async function loginUser(email: string): Promise<User | null> {
  const user = demoUsers.find((u) => u.email === email)
  if (user) {
    await setUserCookie(user)
    return user
  }
  return null
}

// Require authentication (server-side)
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
