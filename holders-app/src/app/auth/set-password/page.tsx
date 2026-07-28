'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function establishSession() {
      // The tokens arrive in the URL hash, e.g.:
      // #access_token=...&refresh_token=...&type=invite
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (error) {
          toast.error('This invite link is invalid or has expired.')
          router.replace('/auth/login')
          return
        }

        // Clean the sensitive token out of the URL bar
        window.history.replaceState(null, '', '/auth/set-password')
        setReady(true)
      } else {
        // No token present — someone navigated here directly
        toast.error('No invite token found.')
        router.replace('/auth/login')
      }
    }

    establishSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password set! Redirecting…')
    router.replace('/dashboard')
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying your invite…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Set your password</h1>
        <p className="text-sm text-gray-500">
          Choose a password to finish setting up your account.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Set password'}
        </button>
      </form>
    </div>
  )
}
