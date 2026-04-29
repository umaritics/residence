import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// In-memory rate limiter store
// Key: IP address + route type (e.g., "127.0.0.1:admin")
// Value: { count: number, resetAt: number }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(
  req: NextRequest,
  role: "Admin" | "Agent" | "Anonymous"
): boolean {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const key = `${ip}:${role}`;

  const limit = role === "Admin" ? 200 : 50; // Admins get 200 req/min, Agents/Anonymous get 50 req/min
  const windowMs = 60 * 1000; // 1 minute

  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || record.resetAt < now) {
    // Reset or initialize
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  // Increment
  record.count += 1;
  rateLimitMap.set(key, record);
  return true;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.pathname;

  // 1. Rate Limiting for API routes
  if (url.startsWith("/api")) {
    const role = token?.role || "Anonymous";
    const allowed = rateLimit(req, role as "Admin" | "Agent" | "Anonymous");

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Role-Based Access Control (RBAC)
  const isAuthRoute = url.startsWith("/login") || url.startsWith("/register");
  
  if (isAuthRoute) {
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protect root, /dashboard, and /admin routes (Admin Only)
  const isAdminRoute = url === "/" || url === "/dashboard" || url.startsWith("/admin");
  
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "Admin") {
      // Redirect unauthorized agents to their dedicated workspace
      return NextResponse.redirect(new URL("/agent-leads", req.url));
    }
  }

  // Protect /agent-leads (Agents and Admins)
  if (url.startsWith("/agent-leads")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
