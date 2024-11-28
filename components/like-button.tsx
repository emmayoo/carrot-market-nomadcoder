"use client";

import { useOptimistic, useTransition } from "react";
import { HandThumbUpIcon } from "@heroicons/react/16/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { dislikePost, likePost } from "@/app/posts/[id]/action";

interface LikButtonProps {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}
export default function LikeButton({
  postId,
  isLiked,
  likeCount,
}: LikButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [state, reducerFn] = useOptimistic(
    { isLiked, likeCount },
    (previousState) => {
      // (previousState, payload)
      return {
        isLiked: !previousState.isLiked,
        likeCount: previousState.isLiked
          ? previousState.likeCount - 1
          : previousState.likeCount + 1,
      };
    }
  );

  const onClick = () => {
    startTransition(async () => {
      reducerFn(undefined);
      if (state.isLiked) {
        await dislikePost(postId);
      } else {
        await likePost(postId);
      }
    });
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-neutral-400 text-sm border border-neutral-400 rounded-full p-2 transition-colors ${
        state.isLiked
          ? "bg-orange-500 text-white border-orange-500"
          : "hover:bg-neutral-800"
      }`}
    >
      {isPending ? "updating..." : null}
      {state.isLiked ? (
        <HandThumbUpIcon className="size-5" />
      ) : (
        <OutlineHandThumbUpIcon className="size-5" />
      )}
      {state.isLiked ? (
        <span> {state.likeCount}</span>
      ) : (
        <span>공감하기 ({state.likeCount})</span>
      )}
    </button>
  );
}
