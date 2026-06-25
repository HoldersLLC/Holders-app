import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require at least Basic plan
const BASIC_ROUTES = ['/range-sessions', '/documents']

// Routes that require Pro plan
const PRO_ROUTES = ['/reports']

// Routes always accessible (free tier + unauthed)
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/pricing', '/api/webhooks']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and API routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { response.cookies.set({ name, value, ...options }) },
        remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — redirect to login
  if (!user && pathname.startsWith('/dashboard') || !user && pathname.startsWith('/firearms')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!user) return response

  // Get membership
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership')
    .eq('id', user.id)
    .single()

  const membership = profile?.membership || 'free'

  // Check Pro routes
  if (PRO_ROUTES.some(r => pathname.startsWith(r)) && membership !== 'pro' && membership !== 'admin') {
    return NextResponse.redirect(new URL('/pricing?required=pro', request.url))
  }

  // Check Basic routes
  if (BASIC_ROUTES.some(r => pathname.startsWith(r)) && membership === 'free') {
    return NextResponse.redirect(new URL('/pricing?required=basic', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon).*)'],
}
