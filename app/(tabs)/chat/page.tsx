import db from "@/lib/db";
import Image from "next/image";

import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { formatToTimeAgo, truncateString } from "@/lib/utils";
import Link from "next/link";

const getChatroomList = async () => {
  const session = await getSession();
  if (!session) notFound();

  const chatrooms = await db.chatRoom.findMany({
    where: {
      users: {
        some: {
          id: session.id,
        },
      },
    },
    select: {
      id: true,
      created_at: true,
      users: {
        where: {
          id: {
            not: session.id,
          },
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          payload: true,
          created_at: true,
        },
      },
    },
  });

  if (chatrooms.length === 0) return null;

  const sortedChatrooms = chatrooms.sort((a, b) => {
    const aMessageTime = a.messages[0]?.created_at || a.created_at;
    const bMessageTime = b.messages[0]?.created_at || b.created_at;
    return new Date(bMessageTime).getTime() - new Date(aMessageTime).getTime();
  });

  return sortedChatrooms;
};

const getUnreadCounts = async () => {
  const session = await getSession();

  const unreadMessagesCount = await db.unReadMessages.findMany({
    where: {
      userId: session.id, // 로그인한 사용자의 userId가 8인 경우
    },
    include: {
      message: {
        select: {
          chatRoomId: true, // 메시지의 chatRoomId를 포함시킴
        },
      },
    },
    orderBy: {
      message: { chatRoomId: "desc" },
    },
  });

  const chatRoomUnreadCounts = unreadMessagesCount.reduce(
    (acc, unReadMessage) => {
      const chatRoomId = unReadMessage.message.chatRoomId;
      acc[chatRoomId] = (acc[chatRoomId] || 0) + 1; // 읽지 않은 메시지 개수 추가
      return acc;
    },
    {} as { [key: string]: number }
  );

  return chatRoomUnreadCounts;
};

export default async function Chat() {
  const chatRooms = await getChatroomList();

  const unReadCounts = await getUnreadCounts();

  return (
    <div className="p-5 flex flex-col gap-5">
      {!chatRooms && <h1>채팅방 없음</h1>}
      {chatRooms?.map((room) => (
        <Link
          href={`chats/${room.id}`}
          key={room.id}
          className="flex justify-between"
        >
          <div className="flex gap-5">
            <div className="relative rounded-full size-16 overflow-hidden">
              <Image
                className="object-cover"
                fill
                src={room.users[0].avatar!}
                alt={room.users[0].username}
              />
            </div>
            <div className="flex flex-col gap-2 justify-center text-white">
              <div className="flex gap-2">
                <b>{room.users[0].username}</b>
                <p>{formatToTimeAgo(new Date(room.messages[0].created_at))}</p>
              </div>
              <p>{truncateString(room.messages[0].payload)}</p>
            </div>
          </div>
          <div className="flex items-center">
            {unReadCounts[room.id] && <p>안 읽음 {unReadCounts[room.id]}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
