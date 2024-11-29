import { revalidatePath } from "next/cache";

async function getData() {
  await fetch("https://nomad-movies.nomadcoders.workers.dev/movies", {
    cache: "force-cache",
  });
}

export default async function Extras() {
  await getData();
  const action = async () => {
    "use server";
    revalidatePath("/extras");
  };

  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-andina">Extras!</h1>
      <h2 className="font-rubick">So much more to learn!</h2>

      <form action={action}>
        <button>revalidate</button>
      </form>
    </div>
  );
}
