import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import { useChatTyping } from "../../../hooks/useChatTyping";
import { useReadReceipts } from "../../../hooks/useReadReceipts";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";

interface MessagesTabProps {
  workspaceId: string;
  userId: string;
  initials: string;
}

interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
}

export const MessagesTab = ({
  workspaceId,
  userId,
  initials,
}: MessagesTabProps) => {
  const { socket, connected } = useSocket();
  const { typingNames, handleTyping, stopTyping } = useChatTyping(
    socket,
    connected,
    workspaceId,
  );
  const { seenUpTo, markRead } = useReadReceipts(socket, connected, workspaceId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!socket || !connected) return;

    isInitialLoad.current = true;
    socket.emit("joinRoom", { workspaceId });

    const onHistory = (page: MessagesPage) => {
      setMessages(page.messages);
      setHasMore(page.hasMore);
    };

    const onOlder = (page: MessagesPage) => {
      const container = scrollRef.current;
      const prevHeight = container?.scrollHeight ?? 0;
      const prevTop = container?.scrollTop ?? 0;

      setMessages((prev) => [...page.messages, ...prev]);
      setHasMore(page.hasMore);
      setLoadingMore(false);

      requestAnimationFrame(() => {
        if (!container) return;
        container.scrollTop = container.scrollHeight - prevHeight + prevTop;
      });
    };

    const onNewMessage = (message: Message) =>
      setMessages((prev) => [...prev, message]);

    socket.on("messageHistory", onHistory);
    socket.on("olderMessages", onOlder);
    socket.on("newMessage", onNewMessage);

    return () => {
      // Tell the server the Messages tab is closing so new-message
      // notifications resume; the socket stays in the room for the unread badge.
      socket.emit("leaveRoom", { workspaceId });
      socket.off("messageHistory", onHistory);
      socket.off("olderMessages", onOlder);
      socket.off("newMessage", onNewMessage);
    };
  }, [socket, connected, workspaceId]);

  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView();
      isInitialLoad.current = false;
      return;
    }
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  // Whenever the visible thread grows (history loaded, message received or
  // sent) while this tab is open, report that we've read up to now.
  useEffect(() => {
    if (messages.length > 0) markRead();
  }, [messages.length, markRead]);

  // The last of *my* messages the other side has already read — gets a "Seen".
  const lastSeenIndex = useMemo(() => {
    if (seenUpTo === null) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.sender.id === userId && new Date(m.createdAt).getTime() <= seenUpTo) {
        return i;
      }
    }
    return -1;
  }, [messages, seenUpTo, userId]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || loadingMore || !hasMore || messages.length === 0) return;
    if (container.scrollTop > 40) return;
    if (!socket || !connected) return;

    setLoadingMore(true);
    socket.emit("loadMoreMessages", {
      workspaceId,
      cursor: messages[0].id,
    });
  };

  const handleSend = (text: string) => {
    if (!socket || !connected) return;
    socket.emit("sendMessage", { workspaceId, content: text });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
      >
        {loadingMore && (
          <div className="text-center text-[11px] text-[#858c87] dark:text-[#6e7672] py-1">
            Loading older messages…
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20 text-center">
            <div>
              <p className="text-[15px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
                No messages yet
              </p>
              <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">
                Send the first message to start the conversation.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender.id === userId;
          const showMeta =
            i === 0 || messages[i - 1].sender.id !== m.sender.id;

          return (
            <Fragment key={m.id}>
              <MessageBubble
                message={m}
                isMe={isMe}
                showMeta={showMeta}
                currentUserInitials={initials}
              />
              {i === lastSeenIndex && (
                <div className="-mt-2 flex justify-end pr-1 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                  <span className="flex items-center gap-1">
                    <CheckCheck size={12} /> Seen
                  </span>
                </div>
              )}
            </Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator names={typingNames} />
      <MessageComposer
        connected={connected}
        onSend={handleSend}
        onTyping={handleTyping}
        onStopTyping={stopTyping}
      />
    </div>
  );
};
