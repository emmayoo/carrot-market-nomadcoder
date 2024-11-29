"use server";
import db from "@/lib/db";

import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

const checkOwner = async (userId: number) => {
  const session = await getSession();
  return session.id === userId;
};

const getChatRoom = async (userId: number) => {
  const session = await getSession();
  const room = await db.chatRoom.findFirst({
    where: {
      AND: [
        { users: { some: { id: userId } } },
        { users: { some: { id: session.id } } },
      ],
    },
  });

  if (room) return room.id;

  const newRoom = await db.chatRoom.create({
    data: {
      users: {
        connect: [
          // 판매자
          {
            id: userId,
          },
          // 구매자
          {
            id: session.id,
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });

  return newRoom.id;
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
  const chatroom_id = await getChatRoom(product.userId);

  return { ...product, is_owner, chatroom_id };
};

export const deleteProduct = async (id: number) => {
  "use server";
  await db.product.delete({ where: { id } });
  redirect("/home");
};
