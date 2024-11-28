"use client";

import Input from "@/components/input";
import Button from "@/components/button";

import { PhotoIcon } from "@heroicons/react/16/solid";
import { useActionState, useState } from "react";
import { updateProduct } from "@/app/product/edit/[id]/actions";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_SIZE_ERROR,
  IMAGE_TYPE_ERROR,
  MAX_IMAGE_SIZE,
} from "@/lib/constants";

interface ProductEditProps {
  id: number;
  photo: string;
  title: string;
  price: number;
  description: string;
}

const validateFile = (file: File) => {
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type))
    return alert(IMAGE_TYPE_ERROR);
  if (file.size > MAX_IMAGE_SIZE) return alert(IMAGE_SIZE_ERROR);
  return true;
};

export default function ProductEdit(product: ProductEditProps) {
  const [state, action] = useActionState(
    updateProduct.bind(null, product.id),
    null
  );

  const [preview, setPreview] = useState(product.photo);

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
    }
  };

  return (
    <div>
      <form action={action} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
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
          defaultValue={product.title}
          required
          placeholder="제목"
          type="text"
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          type="number"
          defaultValue={product.price}
          required
          placeholder="가격"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          type="text"
          defaultValue={product.description}
          required
          placeholder="자세한 설명"
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
