"use client"; // for preview

import Input from "@/components/input";
import Button from "@/components/button";

import { useActionState, useEffect, useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { StateType, getUploadUrl, uploadProduct } from "./actions";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  IMAGE_TYPE_ERROR,
  IMAGE_SIZE_ERROR,
} from "@/lib/constants";

const validateFile = (file: File) => {
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type))
    return alert(IMAGE_TYPE_ERROR);
  if (file.size > MAX_IMAGE_SIZE) return alert(IMAGE_SIZE_ERROR);
  return true;
};

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
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
      const url = URL.createObjectURL(file as Blob);
      setPreview(url);

      const { success, result } = await getUploadUrl();
      if (success) {
        const { id, uploadUrl } = result;
        setImageId(id);
        setUploadUrl(uploadUrl);
      }
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

  const [state, action] = useActionState(uploadProduct, null);
  // const [state, action] = useActionState(interceptAction, null);

  return (
    <div>
      <form action={action} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${state?.fieldErrors.photo ? "" : preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요. (파일 최대 크기: 4MB)
                {state?.fieldErrors.photo}
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
          name="title"
          required
          placeholder="제목"
          type="text"
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          type="number"
          required
          placeholder="가격"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          type="text"
          required
          placeholder="자세한 설명"
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
