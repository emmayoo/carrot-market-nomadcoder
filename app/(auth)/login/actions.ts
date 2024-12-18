"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import { saveSession } from "@/lib/session";

import { typeToFlattenedError, z } from "zod";
import { redirect } from "next/navigation";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";

type StateType = {
  fieldErrors?: typeToFlattenedError<
    { email: string; password: string },
    string
  >["fieldErrors"];
};

const checkEmailExist = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmailExist, "An account with this email doen not exist."),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(PASSWORD_MIN_LENGTH)
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function logIn(prevState: StateType | null, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = await formSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  }

  // if the user is found, check password hash
  const user = await db.user.findUnique({
    where: { email: result.data.email },
    select: { id: true, password: true },
  });

  // SNS 로그인의 경우 password가 없을 수 있음
  const ok = await bcrypt.compare(result.data.password, user?.password ?? "");

  // log the user in
  if (ok) {
    await saveSession(user!.id);

    redirect("/profile");
  } else {
    return {
      fieldErrors: {
        email: [],
        password: ["Wrong password."],
      },
    };
  }
}
