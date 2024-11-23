import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
  "/github/start": true,
  "/github/complete": true,
};

export async function middleware(request: NextRequest) {
  const exists = publicOnlyUrls[request.nextUrl.pathname];

  const session = await getSession();
  if (!session.id && !exists) {
    return NextResponse.redirect(new URL("/", request.url));
  } else if (session.id && exists) {
    return NextResponse.redirect(new URL("/products", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
