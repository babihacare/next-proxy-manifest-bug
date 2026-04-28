import { NextResponse, type NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  // Minimal proxy — just adds a header so we can verify the proxy ran.
  // The bug: on Next 16.2.4 + Turbopack + Windows, this file is never
  // registered in middleware-manifest.json (manifest stays empty), so
  // the function is never invoked at runtime. The build summary
  // silently omits any "Proxy (Middleware)" line — no warning is logged.
  const response = NextResponse.next();
  response.headers.set("x-proxy-ran", "1");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
