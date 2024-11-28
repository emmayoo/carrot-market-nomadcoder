"use client";

import Image from "next/image";
import Button from "@/components/button";
import Input from "@/components/input";

import {
  useActionState,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { Prisma } from "@prisma/client";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatToTimeAgo } from "@/lib/utils";
import {
  creatComment,
  updateComment,
  deleteComment,
} from "@/app/posts/[id]/action";

interface PostCommentsProps {
  comments: ConmmentWithUser[];
  postId: number;
  user: { id: number; avatar: string; username: string };
}

type ConmmentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        username: true;
        avatar: true;
      };
    };
  };
}>;

const isUpdated = (createDate: Date, updateDate: Date) => {
  return new Date(createDate).getTime() < new Date(updateDate).getTime();
};

export default function PostComments({
  comments,
  postId,
  user,
}: PostCommentsProps) {
  const [isEditings, setIsEditings] = useState<{
    [key: number]: boolean;
  }>({});
  const [editedPayloads, setEditedPayloads] = useState<{
    [key: number]: string;
  }>({});

  const [isPending, startTransition] = useTransition();
  const [state, reducerFn] = useOptimistic(
    { comments },
    (previousState, payload) => {
      const temp = {
        id: Date.now(),
        payload: payload,
        created_at: new Date(),
        updated_at: new Date(),
        userId: user.id,
        postId: postId,
        user: {
          username: user.username,
          avatar: user.avatar,
        },
      } as ConmmentWithUser;
      return {
        comments: [temp, ...previousState.comments],
      };
    }
  );

  const [actionState, action] = useActionState(
    creatComment.bind(null, postId, user.id),
    null
  );

  const [updateState, update] = useActionState(
    updateComment.bind(null, postId, user.id),
    null
  );

  useEffect(() => {
    const obj = comments.reduce((acc, v) => {
      acc[v.id] = v.payload;
      return acc;
    }, {} as { [key: number]: string });
    setEditedPayloads(obj);
  }, []);

  const onSumbit = (e: React.FormEvent<HTMLFormElement>) => {
    startTransition(async () => {
      reducerFn(e.currentTarget.comment.value);
    });
  };

  const onDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId, postId, user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const onEditmode = (commentId: number) => {
    setIsEditings({ ...isEditings, [commentId]: true });
  };

  const onCancelEditmode = (commentId: number) => {
    const newObj = { ...isEditings };
    delete newObj[commentId];
    setIsEditings(newObj);
  };

  const onCommentChange = (
    commentId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditedPayloads({ ...editedPayloads, [commentId]: e.target.value });
  };

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <form action={action} onSubmit={onSumbit} className="flex gap-3">
        <Input
          name="comment"
          placeholder="댓글 작성"
          required
          errors={actionState?.fieldErrors?.comment}
          minLength={0}
        />
        <Button text="댓글" />
        {isPending && "서버 업데이트 중"}
      </form>

      {state.comments.map((comment) => (
        <div key={comment.id}>
          <div className="flex gap-3">
            <Image
              width={28}
              height={28}
              className="size-7 rounded-full"
              src={comment.user.avatar!}
              alt={comment.user.username}
            />
            {!isEditings[comment.id] && <div>{comment.payload}</div>}
            {comment.userId === user.id && (
              <div>
                {isEditings[comment.id] ? (
                  <form
                    action={update}
                    onSubmit={() => onCancelEditmode(comment.id)}
                    className="flex gap-3"
                  >
                    <input
                      hidden
                      name="commentId"
                      readOnly
                      value={comment.id}
                    />
                    <Input
                      name="comment"
                      placeholder="댓글 작성"
                      value={editedPayloads[comment.id]}
                      onChange={onCommentChange.bind(null, comment.id)}
                      required
                      errors={updateState?.fieldErrors?.comment}
                      minLength={0}
                    />
                    <Button text="수정" />
                    <XMarkIcon
                      onClick={() => onCancelEditmode(comment.id)}
                      className="size-10"
                    />
                  </form>
                ) : (
                  <PencilSquareIcon
                    className="size-5"
                    onClick={() => onEditmode(comment.id)}
                  >
                    수정
                  </PencilSquareIcon>
                )}

                <TrashIcon
                  className="size-5"
                  onClick={() => onDelete(comment.id)}
                >
                  삭제
                </TrashIcon>
              </div>
            )}
          </div>
          <span>
            {formatToTimeAgo(new Date(comment.updated_at)) +
              (isUpdated(comment.created_at, comment.updated_at)
                ? " (수정됨)"
                : "")}
          </span>
        </div>
      ))}
    </div>
  );
}
