import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

const getSessionId = async () => {
  const session = await getSession();
  const id = session?.id;
  if (!id) notFound();
  return id;
};

export async function getUser() {
  "use cache";

  const id = await getSessionId();

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
