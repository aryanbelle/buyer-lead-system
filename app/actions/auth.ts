'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/lib/auth'

export async function loginAction(user: User) {
  const cookieStore = cookies()
  cookieStore.set('demo-user', JSON.stringify(user), {
    path: '/',
    sameSite: 'lax',
    secure: false, // Set to true in production with HTTPS
    httpOnly: false, // Allow client-side access for fallback
  })
  
  // Don't redirect here - let the client handle it to avoid double navigation
  // redirect('/buyers')
}

export async function logoutAction() {
  const cookieStore = cookies()
  cookieStore.delete('demo-user')
  redirect('/login')
}
