"use server";

import fs from "fs/promises";
import db from "@/lib/db";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { productSchema, StateType } from "./schema";

export async function uploadProduct(
  prevState: StateType | null,
  formData: FormData
) {
  const data = {
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };

  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  }

  // cloudflar 사용 시, 삭제 필요
  const photoData = await result.data.photo.arrayBuffer();
  await fs.appendFile(
    `./public/${result.data.photo.name}`,
    Buffer.from(photoData)
  );
  const photoPath = `/${result.data.photo.name}`;

  const session = await getSession();
  if (session.id) {
    const product = await db.product.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        price: result.data.price,
        photo: photoPath,
        user: {
          connect: {
            id: session.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    redirect(`/products/${product.id}`);
  }
  notFound();
}

export async function getUploadUrl() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data;
}
