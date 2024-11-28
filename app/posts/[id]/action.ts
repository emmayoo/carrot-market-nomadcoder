"use server";

import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/session";
import { typeToFlattenedError, z } from "zod";

export const likePost = async (postId: number) => {
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        postId,
        userId: session.id!,
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {
    console.error(e);
  }
};

export const dislikePost = async (postId: number) => {
  try {
    const session = await getSession();
    await db.like.delete({
      where: {
        id: {
          postId,
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {
    console.error(e);
  }
};

type StateType = {
  fieldErrors?: typeToFlattenedError<
    { comment: string },
    string
  >["fieldErrors"];
};

const formSchema = z.object({
  comment: z.string().min(0, "Comment is required."),
});

export async function creatComment(
  postId: number,
  userId: number,
  prevState: StateType | null,
  formData: FormData
) {
  const data = {
    comment: formData.get("comment"),
  };
  const result = await formSchema.spa(data);

  if (!result.success) {
    return result.error.flatten();
  }

  const ok = await db.comment.create({
    data: {
      payload: result.data.comment,
      postId,
      userId,
    },
  });

  if (!ok) {
    return { fieldErrors: { comment: ["comment server error!"] } };
  }

  revalidateTag(`post-comments-${postId}`);
  return null;
}

export async function updateComment(
  postId: number,
  userId: number,
  prevState: StateType | null,
  formData: FormData
) {
  const data = {
    comment: formData.get("comment"),
  };
  const result = await formSchema.spa(data);
  console.log(result);

  if (!result.success) {
    return result.error.flatten();
  }

  const ok = await db.comment.update({
    where: {
      id: Number(formData.get("commentId")),
      postId,
      userId,
    },
    data: {
      payload: result.data.comment,
    },
  });

  if (!ok) {
    return { fieldErrors: { comment: ["comment server error!"] } };
  }

  revalidateTag(`post-comments-${postId}`);
  return null;
}

export const deleteComment = async (
  commentId: number,
  postId: number,
  userId: number
) => {
  try {
    await db.comment.delete({
      where: {
        id: commentId,
        postId,
        userId,
      },
    });
    revalidateTag(`post-comments-${postId}`);
  } catch (e) {
    console.error(e);
  }
};
