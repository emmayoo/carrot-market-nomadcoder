import Image from "next/image";
import Link from "next/link";

import { connection } from "next/server";
import { formatToTimeAge, formatToWon } from "@/lib/utils";

interface ListProductProps {
  id: number;
  title: string;
  price: number;
  photo: string;
  created_at: Date;
}

export default async function ListProduct({
  id,
  title,
  price,
  photo,
  created_at,
}: ListProductProps) {
  await connection();

  return (
    <Link href={`/products/${id}`} className="flex gap-5">
      <div className="relative size-28 rounded-md overflow-hidden">
        <Image
          className="object-cover"
          fill
          src={photo}
          // src={`${photo}/avatar`}
          alt={title}
        />
      </div>
      <div className="flex flex-col gap-1 *:text-white">
        <span className="text-lg">{title}</span>
        <span className="text-sm text-neutral-500">
          {formatToTimeAge(created_at)}
        </span>
        <span className="text-lg font-semibold">{formatToWon(price)}</span>
      </div>
    </Link>
  );
}
