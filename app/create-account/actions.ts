"use server";
import { z } from "zod";

const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*?[#?!@$%^&*-]).+$/
);

const checkUsername = (username: string) => !username.includes("potato");
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
      .min(3, "way toooooo short!!")
      .max(10)
      .trim()
      // .toLowerCase()
      // .optional(),
      // .transform((username:string) => username.replace("potato", ""))
      .refine(checkUsername, "No potato allowed"),
    email: z.string().email(),
    password: z
      .string()
      .min(10)
      .regex(
        passwordRegex,
        "Passwords must contain at least one UPPERCASE, lowercase, number and special characters #?!@$%^&*-"
      ),
    confirm_password: z.string(),
  })

  .refine(checkPasswords, {
    message: "Both passwords should be the same!",
    path: ["confirm_password"], // path 미설정 시, formErrors
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAccount = async (prevState: any, formData: FormData) => {
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
  const result = formSchema.safeParse(data); // Error 발생하지 않음

  if (!result.success) {
    return result.error.flatten(); // Error를 깔끔하게 보여줌
  }
};
