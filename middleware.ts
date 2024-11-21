import getSession from "./lib/session";

import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log(request.url);

  const session = await getSession();
  console.log(session);

  if (request.nextUrl.pathname === "/profile") {
    console.log(request.cookies.getAll);
    return Response.redirect(new URL("/", request.url));
  }
}
