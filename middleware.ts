import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupportedLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();

    if (pathname.startsWith("/api/auth/")) {
      return response;
    }

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
      } catch {
        isAuthenticated = false;
      }
    }

    if (pathname === "/admin/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname === "/admin/login") {
      return response;
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  const firstSegment = pathname.split("/")[1] || "";
  if (isSupportedLocale(firstSegment)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/uk" : `/uk${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|images/|product-images/|sertificates/|robots.txt|sitemap.xml|site.webmanifest|sw.js|.*\\..*).*)",
  ],
};
