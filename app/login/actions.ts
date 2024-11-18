"use server";

interface IState {
  errors: string[];
}

export const handleForm = async (
  prevState: IState | null,
  formData: FormData
) => {
  console.log(formData.get("email"));

  return prevState ? { errors: ["wrong email", "wrong password"] } : null;
};
