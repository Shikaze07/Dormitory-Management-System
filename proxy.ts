import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/session'

// Define the route access rules
// Prefix: Allowed Roles
const routeRules = [
  { prefix: '/dashboard', roles: ['Admin'] },
  { prefix: '/admin', roles: ['Admin'] },
  { prefix: '/resident', roles: ['Resident'] },
]

const publicRoutes = ['/login', '/']

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname

  // 1. Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname)

  // 2. Get the session
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  // 3. Handle public routes
  if (isPublicRoute) {
    if (session && pathname === '/login') {
      // Redirect logged-in users away from login to their respective home pages
      return NextResponse.redirect(new URL(getHomeRoute(session.role), request.url))
    }
    return NextResponse.next()
  }

  // 4. Handle protected routes
  const rule = routeRules.find(r => pathname.startsWith(r.prefix))

  if (rule) {
    if (!session) {
      // Not logged in -> redirect to login
      const loginUrl = new URL('/login', request.url)
      // Optional: Add redirect parameter
      // loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (!rule.roles.includes(session.role)) {
      // Unauthorized -> redirect to their home page
      return NextResponse.redirect(new URL(getHomeRoute(session.role), request.url))
    }
  }

  // 5. If it's a protected route not specifically defined in rules (like unknown subfolders)
  // and user is not logged in, we might want to protect it too.
  // But for now, we follow the explicit rules.

  return NextResponse.next()
}

function getHomeRoute(role: string): string {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard'
    case 'Resident':
      return '/resident/profile'
    case 'Guard':
    default:
      return '/login'
  }
}

// Routes that the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
