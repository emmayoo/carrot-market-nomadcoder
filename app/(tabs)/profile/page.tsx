import db from "@/lib/db";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Suspense } from "react";

export async function getUser() {
  const session = await getSession();
  const id = session?.id;
  if (!id) notFound();
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (user) {
    return user;
  }

  notFound();
}

async function Username() {
  const user = await getUser();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <h1>welcome, {user?.username}!</h1>;
}

export default async function Profile() {
  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div>
      <Suspense fallback={"Hello"}>
        <Username />
      </Suspense>
      <form action={logOut}>
        <button>Logout</button>
      </form>
    </div>
  );
}
