import { typeToFlattenedError, z } from "zod";
import {
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_TYPE_ERROR,
  IMAGE_SIZE_ERROR,
} from "@/lib/constants";

export const productSchema = z.object({
  photo: z
    .instanceof(File, { message: "Please select an image file." })
    .refine((file) => file.size <= MAX_IMAGE_SIZE, {
      message: IMAGE_SIZE_ERROR,
    })
    .refine((file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file.type), {
      message: IMAGE_TYPE_ERROR,
    }),
  title: z.string().min(1, { message: "Title is required" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export type FormType = z.infer<typeof productSchema>;

export type StateType = {
  fieldErrors?: typeToFlattenedError<FormType, string>["fieldErrors"];
};
