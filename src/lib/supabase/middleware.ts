import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Refresh the session — this is critical for keeping auth alive
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // DEBUG: Log middleware activity (remove in production)
  console.log('[MIDDLEWARE]', request.nextUrl.pathname, {
    hasUser: !!user,
    userEmail: user?.email ?? null,
    error: error?.message ?? null,
    cookieCount: request.cookies.getAll().length,
  })

  const pathname = request.nextUrl.pathname

  // Routes that require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!user) {
      console.log('[MIDDLEWARE] No user, redirecting to /auth/login')
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      // IMPORTANT: Copy session cookies to redirect response
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  // Routes for unauthenticated users only
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (user) {
      console.log('[MIDDLEWARE] User found on auth page, redirecting to /dashboard')
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      // IMPORTANT: Copy session cookies to redirect response
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}
