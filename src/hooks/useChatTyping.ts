import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

interface UserTypingEvent {
  userId: string;
  name: string;
  isTyping: boolean;
}

// Stop broadcasting "typing" after this much keyboard inactivity.
const STOP_DELAY = 2000;
// Safety net: drop a remote typer if no fresh signal arrives (a "stop" can be
// lost on a flaky connection), so the indicator never sticks forever.
const RECEIVE_TTL = 4000;

/**
 * Two-way chat typing state: emits throttled "typing" signals for the current
 * user and tracks which other users are currently typing in the room.
 */
export const useChatTyping = (
  socket: Socket | null,
  connected: boolean,
  workspaceId: string,
) => {
  const [typingNames, setTypingNames] = useState<Record<string, string>>({});
  const isTypingRef = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttlTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const emit = useCallback(
    (isTyping: boolean) => {
      if (!socket || !connected) return;
      socket.emit("typing", { workspaceId, isTyping });
    },
    [socket, connected, workspaceId],
  );

  // Call on every keystroke: announces "typing" once, then re-arms the stop.
  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emit(true);
    }
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      emit(false);
    }, STOP_DELAY);
  }, [emit]);

  // Call when a message is sent — stop immediately.
  const stopTyping = useCallback(() => {
    if (stopTimer.current) clearTimeout(stopTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emit(false);
    }
  }, [emit]);

  useEffect(() => {
    if (!socket || !connected) return;

    const onUserTyping = ({ userId, name, isTyping }: UserTypingEvent) => {
      if (ttlTimers.current[userId]) clearTimeout(ttlTimers.current[userId]);
      setTypingNames((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = name || "Someone";
        else delete next[userId];
        return next;
      });
      if (isTyping) {
        ttlTimers.current[userId] = setTimeout(() => {
          setTypingNames((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        }, RECEIVE_TTL);
      }
    };

    socket.on("userTyping", onUserTyping);
    return () => {
      socket.off("userTyping", onUserTyping);
    };
  }, [socket, connected]);

  // Reset everything when the room changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      Object.values(ttlTimers.current).forEach(clearTimeout);
      ttlTimers.current = {};
      isTypingRef.current = false;
      setTypingNames({});
    };
  }, [workspaceId]);

  return { typingNames: Object.values(typingNames), handleTyping, stopTyping };
};
