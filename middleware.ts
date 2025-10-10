import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to API routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get("admin_auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const token = authCookie.value;
      const decoded = Buffer.from(token, "base64").toString();
      const [user, password] = decoded.split(":");

      const validUser = process.env.ADMIN_USER;
      const validPass = process.env.ADMIN_PASS;

      if (user === validUser && password === validPass) {
        isAuthenticated = true;
      }
    } catch (e) {
      return NextResponse.json(`INVALID TOKEN ${e}`);
    }
  }

  // If user is authenticated and trying to access login page, redirect to admin
  if (pathname === "/admin/login" && isAuthenticated) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Allow access to login page if not authenticated
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Protect admin pages
};
