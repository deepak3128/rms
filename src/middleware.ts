import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const roleRoutes: Record<string, string[]> = {
  owner: ["/owner"],
  manager: ["/owner", "/cashier"],
  waiter: ["/waiter"],
  chef: ["/chef"],
  cashier: ["/cashier"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const sessionCookie = req.cookies.get("authjs.session-token")?.value
  const sessionSecureCookie = req.cookies.get("__Secure-authjs.session-token")?.value
  const hasSession = !!(sessionCookie || sessionSecureCookie)

  const isProtectedRoute =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/waiter") ||
    pathname.startsWith("/chef") ||
    pathname.startsWith("/cashier") ||
    pathname.startsWith("/tables") ||
    pathname.startsWith("/inventory") ||
    pathname === "/menu" ||
    pathname === "/menu/"

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL("/waiter", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|$).*)",
  ],
}
