import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUser } from "./action";

export default async function Profile() {
  const user = await getUser();

  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div>
      <h1>welcome, {user?.username}!</h1>
      <form action={logOut}>
        <button>Logout</button>
      </form>
    </div>
  );
}
