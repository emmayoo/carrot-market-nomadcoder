"use server";

import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { typeToFlattenedError, z } from "zod";
import {
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_TYPE_ERROR,
  IMAGE_SIZE_ERROR,
} from "@/lib/constants";
import { getSession } from "@/lib/session";
import db from "@/lib/db";

const productSchema = z.object({
  photo: z
    .instanceof(File, { message: "Please select an image file." })
    .refine(async (file) => file.size <= MAX_IMAGE_SIZE, {
      message: IMAGE_SIZE_ERROR,
    })
    .refine(async (file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type), {
      message: IMAGE_TYPE_ERROR,
    })
    .optional(),
  title: z.string().min(1, { message: "Title is required" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

type FormType = z.infer<typeof productSchema>;

type StateType = {
  fieldErrors?: typeToFlattenedError<FormType, string>["fieldErrors"];
};

export async function updateProduct(
  id: number,
  prevState: StateType | null,
  formData: FormData
) {
  const data: { [key: string]: FormDataEntryValue | null } = {
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };

  const formPhoto = formData.get("photo");
  if (formPhoto instanceof File && formPhoto) {
    if (formPhoto.name !== "undefined") data.photo = formPhoto;
  }

  const result = await productSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  }

  const updateData: {
    photo?: string;
    title: string;
    price: number;
    description: string;
  } = {
    title: result.data.title,
    price: result.data.price,
    description: result.data.description,
  };

  if (result.data.photo) {
    const photoData = await result.data.photo.arrayBuffer();
    await fs.appendFile(
      `./public/${result.data.photo.name}`,
      Buffer.from(photoData)
    );
    const photoPath = `/${result.data.photo.name}`;
    updateData.photo = photoPath;
  }

  const session = await getSession();
  if (session.id) {
    const product = await db.product.update({
      where: {
        id,
      },
      data: updateData,
    });

    redirect(`/products/${product.id}`);
  }

  notFound();
}
