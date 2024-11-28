"use client";

import { Prisma } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

import { UserIcon } from "@heroicons/react/16/solid";
import { formatToWon } from "@/lib/utils";
import { deleteProduct } from "@/app/products/[id]/actions";

interface ProductDetailContentProp {
  product: ProductWithUser & { is_owner: boolean };
}

type ProductWithUser = Prisma.ProductGetPayload<{
  include: {
    user: {
      select: {
        username: true;
        avatar: true;
      };
    };
  };
}>;

export default function ProductDetailContent({
  product,
}: ProductDetailContentProp) {
  return (
    <div>
      <div className="relative aspect-square">
        <Image
          className="object-cover"
          fill
          src={product.photo}
          // src={`${product.photo}/public`}
          alt={product.title}
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5 pb-[80px]">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full h-[80px] bottom-0 left-0 p-5 pb-5 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {product.is_owner ? (
          <>
            <button
              onClick={() => deleteProduct(product.id)}
              className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold"
            >
              Delete product
            </button>
            <Link
              href={`/product/edit/${product.id}`}
              className="bg-green-500 px-5 py-2.5 rounded-md text-white font-semibold"
            >
              Edit product
            </Link>
          </>
        ) : null}
        <Link
          className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold"
          href={``}
        >
          채팅하기
        </Link>
      </div>
    </div>
  );
}
