import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Petri's admin email - only this user can access /admin
const ADMIN_EMAIL = 'petri.kallio@sahkotarkastuksetkallio.fi'

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public admin routes that don't require auth
  const isAdminLoginPage = pathname === '/admin/login'
  const isAdminUnauthorizedPage = pathname === '/admin/unauthorized'
  const isProtectedAdminRoute = pathname.startsWith('/admin') && !isAdminLoginPage && !isAdminUnauthorizedPage

  // If logged in admin visits login page, redirect to dashboard
  if (isAdminLoginPage && user && user.email === ADMIN_EMAIL) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // Protect /admin routes (except login and unauthorized pages)
  if (isProtectedAdminRoute) {
    // If not logged in, redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // If logged in but not the admin, redirect to unauthorized
    if (user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
