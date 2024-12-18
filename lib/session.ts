import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";

// id 없이 앱을 사용하는 user도 session id를 가질 수 있음
interface SessionContent {
  id?: number;
}

export const getSession = async () => {
  return await getIronSession<SessionContent>(await cookies(), {
    cookieName: "delicious-karrot",
    password: process.env.COOKIE_PASSWORD,
  } as SessionOptions);
};

export const saveSession = async (id: number) => {
  const session = await getSession();
  session.id = id;
  await session.save();
};
