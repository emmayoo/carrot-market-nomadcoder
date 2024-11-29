"use client";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { InitialChatMessages } from "@/app/chats/[id]/page";
import { formatToTimeAgo } from "@/lib/utils";
import { saveMessage } from "@/app/chats/actions";

interface ChatMessageListProps {
  initialMessages: InitialChatMessages;
  chatRoomId: string;
  userId: number;
  username: string;
  avatar: string;
}
export default function ChatMessagesList({
  initialMessages,
  chatRoomId,
  userId,
  username,
  avatar,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const socket = useRef<WebSocket>();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: Date.now(),
      payload: message,
      created_at: new Date(),
      userId,
      user: {
        username,
        avatar,
      },
    };

    setMessages((prevMsgs) => [...prevMsgs, payload]);

    if (chatRoomId && message) {
      socket.current?.send(
        JSON.stringify({ type: "message", roomId: chatRoomId, payload })
      );
    }

    await saveMessage(message, chatRoomId);

    setMessage("");
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("WebSocket 연결 성공!");
      ws.send(JSON.stringify({ type: "join", roomId: chatRoomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as {
        payload: InitialChatMessages[0];
      };
      setMessages((prevMsgs) => [...prevMsgs, data.payload]);
    };

    socket.current = ws;

    return () => {
      ws.onclose = () => {
        console.log("WebSocket 연결 종료.");
      };
    };
  }, [chatRoomId]);

  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.userId === userId ? null : (
            <Image
              src={message.user.avatar!}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <span
              className={`${
                message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
              } p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span className="text-xs">
              {formatToTimeAgo(new Date(message.created_at))}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
