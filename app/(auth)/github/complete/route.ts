import db from "@/lib/db";

import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { saveSession } from "@/lib/session";

const getAccessToken = async (code: string) => {
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return await accessTokenResponse.json();
};

const getUserInfo = async (access_token: string) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache", // Next.js cache에 저장되는 것을 방지
  });
  return await response.json();
};

const getUserEmail = async (access_token: string) => {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-cache", // Next.js cache에 저장되는 것을 방지
  });
  return (await response.json())[0].email ?? "";
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    // return notFound();
    return new Response(null, {
      status: 400,
    });
  }

  const { error, access_token } = await getAccessToken(code);
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  const { id, avatar_url, login } = await getUserInfo(access_token);
  const github_id = id + "";

  const user = await db.user.findUnique({
    where: {
      github_id,
    },
    select: {
      id: true,
    },
  });

  if (user) {
    await saveSession(user.id);

    return redirect("/profile");
  }

  const email = await getUserEmail(access_token);

  const usernameExist = await db.user.findUnique({
    where: {
      username: login,
    },
    select: {
      id: true,
    },
  });

  const newUsername = !usernameExist ? login : login + "_" + github_id;
  const newUser = await db.user.create({
    data: {
      username: newUsername,
      github_id: github_id,
      avatar: avatar_url,
      email: email,
    },
    select: {
      id: true,
    },
  });

  await saveSession(newUser.id);

  return redirect("/profile");
}
