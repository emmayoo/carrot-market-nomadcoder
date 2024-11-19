"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation.js";

interface ActionState {
  token: boolean;
}

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

const tokenSchma = z.coerce.number().min(100000).max(999999);

export const smsLogIn = async (prevState: ActionState, formData: FormData) => {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return { token: false, error: result.error.flatten() };
    } else {
      return { token: true };
    }
  }

  const result = tokenSchma.safeParse(token);
  if (!result.success) {
    return { token: true, error: result.error.flatten() };
  } else {
    redirect("/");
  }
};
