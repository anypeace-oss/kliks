// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: new Headers(request.headers),
  });

  // Jika mencoba akses /studio/* tanpa session
  if (request.nextUrl.pathname.startsWith("/studio") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};
