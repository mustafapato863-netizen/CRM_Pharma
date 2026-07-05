import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from '@/utils/supabase/middleware';
import { getToken } from "next-auth/jwt";

const protectedPrefixes = ["/dashboard", "/products", "/parties", "/stock", "/ledger", "/reports", "/expiry-alerts", "/users", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = await updateSession(request);
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/parties/:path*",
    "/stock/:path*",
    "/ledger/:path*",
    "/reports/:path*",
    "/expiry-alerts/:path*",
    "/users/:path*",
    "/settings/:path*",
  ],
};
