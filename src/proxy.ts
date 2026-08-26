import { NextResponse, type NextRequest } from "next/server";
import {
  getAccessCookieName,
  isAccessGateEnabled,
  isValidAccessToken,
} from "@/lib/access/session";

const PUBLIC_PATHS = new Set([
  "/unlock",
  "/sw.js",
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
  "/robots.txt",
]);

export async function proxy(request: NextRequest) {
  if (!isAccessGateEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAccessCookieName())?.value;
  if (await isValidAccessToken(token)) {
    return NextResponse.next();
  }

  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = "/unlock";
  unlockUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
