import db from "@/lib/db";
import ChatMessagesList from "@/components/chat-messages-list";

import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";

async function getRoom(id: string) {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: { id: true },
      },
    },
  });

  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));

    if (!canSee) {
      return null;
    }
  }
  return room;
}

async function getMessages(chatRoomId: string) {
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

async function getUserProfile() {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  });
  return user;
}

export default async function ChatRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const roomId = (await params).id;
  const room = await getRoom(roomId);

  if (!room) {
    return notFound();
  }

  const initialMessages = await getMessages(roomId);

  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }

  return (
    <ChatMessagesList
      chatRoomId={roomId}
      userId={user.id}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
