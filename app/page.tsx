import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function HomePage() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get('demo-user')
  
  if (userCookie && userCookie.value) {
    redirect('/buyers')
  } else {
    redirect('/login')
  }
}
