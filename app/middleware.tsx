import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") 
    {
        return NextResponse.redirect(new URL("/full-page", req.url));
    }

  return NextResponse.next();
}
