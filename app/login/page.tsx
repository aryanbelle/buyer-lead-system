import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LoginFormServer } from "@/components/auth/login-form-server"

const demoUsers = [
  { id: "admin-1", name: "Admin User", email: "admin@company.com", role: "admin" },
  { id: "agent-1", name: "Sales Agent", email: "agent@company.com", role: "agent" },
]

export default async function LoginPage() {
  // Check if already logged in
  const cookieStore = cookies()
  const userCookie = cookieStore.get('demo-user')
  
  if (userCookie && userCookie.value) {
    redirect('/buyers')
  }

  // Server action for login
  async function loginAction(formData: FormData) {
    'use server'
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (email && password) {
      // Find user or use default
      const user = demoUsers.find(u => u.email === email) || demoUsers[0]
      
      // Set cookie
      const cookieStore = cookies()
      cookieStore.set('demo-user', JSON.stringify(user), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
      
      redirect('/buyers')
    }
  }

  return <LoginFormServer loginAction={loginAction} />
}
