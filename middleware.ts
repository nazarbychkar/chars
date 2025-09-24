import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const basicAuth = authHeader?.split(" ")[1];
  const [user, password] = atob(basicAuth || "").split(":");

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (user === validUser && password === validPass) {
    return NextResponse.next();
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": "Basic",
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"], // Protect admin pages
};
