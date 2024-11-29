import HackedComponent from "@/components/hacked-component";
import { experimental_taintUniqueValue } from "react";

async function getData() {
  await fetch("https://nomad-movies.nomadcoders.workers.dev/movies", {
    cache: "force-cache",
  });

  const keys = {
    apiKey: "public key",
    secret: "private key (very important)",
  };
  // experimental_taintObjectReference("API Keys were leaked!!!", keys);
  experimental_taintUniqueValue(
    "Secret key was exposed!!!!!!!!!!!!!!",
    keys,
    keys.secret
  );
  return keys;
}

export default async function Extras() {
  const data = await getData();

  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-andina">Extras!</h1>
      <h2 className="font-rubick">So much more to learn!</h2>

      <HackedComponent data={data} />
    </div>
  );
}
