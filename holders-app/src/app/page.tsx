'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function decideRoute() {
      const hash = window.location.hash.substring(1)

      // Invite / recovery links land here with a token in the hash.
      // Forward them (and the token) to the set-password page.
      if (hash.includes('type=invite') || hash.includes('type=recovery')) {
        router.replace('/auth/set-password' + window.location.hash)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      router.replace(user ? '/dashboard' : '/auth/login')
    }

    decideRoute()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading…</p>
    </div>
  )
}
