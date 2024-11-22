import { NextResponse } from "next/server";

export async function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user,user:email",
    allow_signup: "true", // default: true
  };
  const formattedParams = new URLSearchParams(params).toString();

  return NextResponse.json({ url: `${baseURL}?${formattedParams}` });
}
