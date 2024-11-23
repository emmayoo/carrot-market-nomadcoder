"use server";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import getSession from "@/lib/session";

import { redirect } from "next/navigation";
import { typeToFlattenedError, z } from "zod";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";

const checkUsername = (username: string) => !username.includes("potato");
const checkUsernameUnique = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  return !user;
};

const checkEmailUnique = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !user;
};

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

// const usernameSchema = z.string().min(3).max(10);
const formSchema = z
  .object({
    username: z
      .string({
        required_error: "where is my username???",
        invalid_type_error: "username must be a string.",
      })
      // .min(3, "way toooooo short!!")
      // .max(10)
      .trim()
      // .toLowerCase()
      // .optional(),
      // .transform((username:string) => username.replace("potato", ""))
      .refine(checkUsername, "No potato allowed"),
    // .refine(checkUsernameUnique, "This username is already taken."),
    email: z.string().email(),
    // .refine(checkEmailUnique, "There is an account already registered with that email."),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string(),
  })
  // zod는 데이터를 검사하고 refinementCtx에 에러를 추가
  .superRefine(async (data, ctx) => {
    const { username, email } = data;
    let result = await checkUsernameUnique(username);
    if (!result) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "This username is already taken.",
        fatal: true, // refine 중지
      });
      return z.NEVER; // refine 중지
    }
    result = await checkEmailUnique(email);
    if (!result) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "There is an account already registered with that email.",
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .refine(checkPasswords, {
    message: "Both passwords should be the same!",
    path: ["confirm_password"], // path 미설정 시, formErrors
  });

type Form = z.infer<typeof formSchema>;

type StateType = {
  fieldErrors: typeToFlattenedError<Form>["fieldErrors"];
};

export const createAccount = async (
  prevState: StateType | null,
  formData: FormData
) => {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirmPassword"),
  };

  // usernameSchema.parse(data.username);
  // try {
  // 	formSchema.parse(data); // 유효하지 않은 데이터는 throw Error 발생
  // } catch (e) {
  // 	console.log(e);
  // }

  // const result = await formSchema.safeParseAsync(data); // Error 발생하지 않음 + async/await
  const result = await formSchema.spa(data); // spa: safeParseAsync 약자

  if (!result.success) {
    return result.error.flatten(); // Error를 깔끔하게 보여줌
  }

  // hash password
  const hashedPassword = await bcrypt.hash(result.data.password, 12);

  // save the suer to db
  const user = await db.user.create({
    data: {
      username: result.data.username,
      email: result.data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
    },
  });

  // log the user in
  const session = await getSession();
  session.id = user.id;

  await session.save();

  // redirect "/home"
  redirect("/profile");
};
