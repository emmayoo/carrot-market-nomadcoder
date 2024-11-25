"use server";
import db from "@/lib/db";

import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

const checkOwner = async (userId: number) => {
  const session = await getSession();
  return session.id === userId;
};

export const getProduct = async (id: number) => {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
};

export const getProductDetail = async (id: number) => {
  if (isNaN(id)) {
    return notFound();
  }

  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }

  const is_owner = await checkOwner(product.userId);

  return { ...product, is_owner };
};

export const deleteProduct = async (id: number) => {
  "use server";
  await db.product.delete({ where: { id } });
  redirect("/home");
};
