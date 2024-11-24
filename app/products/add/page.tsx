"use client";

import Input from "@/components/input";
import Button from "@/components/button";

import { /*useActionState,*/ useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { /*getUploadUrl,*/ uploadProduct } from "./actions";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  IMAGE_TYPE_ERROR,
  IMAGE_SIZE_ERROR,
} from "@/lib/constants";
import { FormType, productSchema, StateType } from "./schema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateFile = (file: File) => {
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type))
    return alert(IMAGE_TYPE_ERROR);
  if (file.size > MAX_IMAGE_SIZE) return alert(IMAGE_SIZE_ERROR);
  return true;
};

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadUrl, setUploadUrl] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageId, setImageId] = useState("");

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];

    if (validateFile(file)) {
      const b = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(b);
      setPreview(url);
      setValue("photo", file);
      clearErrors("photo");

      // cloudflare
      // const { success, result } = await getUploadUrl();
      // if (success) {
      //   const { id, uploadUrl } = result;
      //   setImageId(id);
      //   setUploadUrl(uploadUrl);
      // }
    }
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(preview);
  });

  // cloudflare를 사용한 이미지 업로드
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const interceptAction = async (_: StateType | null, formData: FormData) => {
    // 1. upload image to cloudflare
    const file = formData.get("photo");
    if (!file) {
      return null;
    }
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);
    const response = await fetch(uploadUrl, {
      method: "post",
      body: cloudflareForm,
    });
    console.log(await response.text());
    if (response.status !== 200) {
      return null;
    }
    const photoUrl = `https://imagedelivery.net/aSbksvJjax-AUC7qVnaC4A/${imageId}`;

    // 2. replace 'photo' in formData
    formData.set("photo", photoUrl);

    // 3. call upload product
    // 이 경우 photo는 string (by. 2번 과정) => zod 수정하기
    return uploadProduct(_, formData);
  };

  // fs 사용 (rhf 미사용)
  // const [state, action] = useActionState(uploadProduct, null);
  // cloudflare 사용 (rhf 미사용)
  // const [state, action] = useActionState(interceptAction, null);

  // rhf 사용
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm<FormType>({
    resolver: zodResolver(productSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (data: FormType) => {
    const formData = new FormData();
    formData.append("photo", data.photo);
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    const { fieldErrors } = await uploadProduct(null, formData);

    if (fieldErrors["title"])
      setError("title", { message: fieldErrors["title"][0] });
    if (fieldErrors["price"])
      setError("price", { message: fieldErrors["price"][0] });
    if (fieldErrors["description"])
      setError("description", { message: fieldErrors["description"][0] });
    if (fieldErrors["photo"])
      setError("photo", { message: fieldErrors["photo"][0] });
  });

  const onValid = async () => {
    await onSubmit();
  };

  return (
    <div>
      <form action={onValid} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: errors.photo ? "" : `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요. (파일 최대 크기: 4MB)
                {errors.photo?.message}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <Input
          {...register("title")}
          required
          placeholder="제목"
          type="text"
          errors={[errors.title?.message ?? ""]}
        />
        <Input
          {...register("price")}
          type="number"
          required
          placeholder="가격"
          errors={[errors.price?.message ?? ""]}
        />
        <Input
          {...register("description")}
          type="text"
          required
          placeholder="자세한 설명"
          errors={[errors.description?.message ?? ""]}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
