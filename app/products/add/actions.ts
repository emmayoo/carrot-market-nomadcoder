"use server";

import fs from "fs/promises";
import db from "@/lib/db";

import { typeToFlattenedError, z } from "zod";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import {
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_TYPE_ERROR,
  IMAGE_SIZE_ERROR,
} from "@/lib/constants";

const productSchema = z.object({
  photo: z
    .instanceof(File, { message: "Please select an image file." })
    .refine((file) => file.size <= MAX_IMAGE_SIZE, {
      message: IMAGE_SIZE_ERROR,
    })
    .refine((file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type), {
      message: IMAGE_TYPE_ERROR,
    }),
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  price: z.coerce.number({
    required_error: "Price is required",
  }),
});

type StateType = {
  fieldErrors?: typeToFlattenedError<
    z.infer<typeof productSchema>,
    string
  >["fieldErrors"];
};

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
