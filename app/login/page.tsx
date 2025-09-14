import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LoginPageClient } from "@/components/auth/login-page-client"

export default async function LoginPage() {
  // Check if already logged in
  const cookieStore = cookies()
  const userCookie = cookieStore.get('demo-user')
  
  if (userCookie && userCookie.value) {
    redirect('/buyers')
  }

  return <LoginPageClient />
}
