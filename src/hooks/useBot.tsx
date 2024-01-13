import { useEffect, useRef, useState } from "react";
import useChat, { ChatMessageType, useSettings } from "../store/store";
import { fetchResults } from "../services/chatService";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  index: number;
  chat: ChatMessageType;
};

export default function useBot({ index, chat }: Props) {
  const resultRef = useRef(chat.content);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState(chat.content);
  const [error, setError] = useState("");
  const [isStreamCompleted, setIsStreamCompleted] = useState(false);
  const query = useChat((state) => state.chats[index - 1].content);
  const [chats, addChat] = useChat((state) => [state.chats, state.addChat]);
  const [sendHistory, selectedModal, systemMessage, useForAllChats] =
    useSettings((state) => [
      state.settings.sendChatHistory,
      state.settings.selectedModal,
      state.settings.systemMessage,
      state.settings.useSystemMessageForAllChats,
    ]);
  const chatsRef = useRef(chats);

  chatsRef.current = chats;

  const scrollToBottom = useDebouncedCallback(() => {
    if (!cursorRef.current) return;
    cursorRef.current.scrollIntoView(true);
  }, 50);

  useEffect(() => {
    function addMessage() {
      addChat(
        { role: "assistant", content: resultRef.current, id: chat.id },
        index
      );
      setIsStreamCompleted(true);
    }

    function handleOnData(data: string) {
      resultRef.current += data;
      setResult((prev) => prev + data);
      scrollToBottom();
    }

    function handleOnError(error: Error | string) {
      if (typeof error === "string") setError(error);
      else setError(error.message);
      resultRef.current = "hello.";
      setResult("A reversal of a loan refers to the process of undoing acanceling a loan transaction that has already taken place. It typically occurs when the borrower or lender decides to reverse the loan agreement and return the , borrowed funds or cancel the debt. In the context provided, the reversal of a loan may occur when a transferor invests in the SRs/PTCs issued by ARCs in respect of the stressed loans transferred by them to the ARC. The transferor carries the investment in their books on an ongoing basis until its transfer or realization, at the lower of the redemption value of SRs based on the NAV and the NBV of the transferred stressed loan at the time of transfer.");
      addMessage();
    }

    function handleOnCompletion() {
      addMessage();
    }
    if (chat.content) return;
    let mounted = true;
    const controller = new AbortController();
    let signal = controller.signal;

    setResult("");
    resultRef.current = "";
    setIsStreamCompleted(false);
    setError("");
    (async () => {
      try {
        let prevChats = sendHistory
          ? chatsRef.current
              .slice(0, index)
              .map((chat) => ({ role: chat.role, content: chat.content }))
          : [
              {
                role: chatsRef.current[index - 1].role,
                content: chatsRef.current[index - 1].content,
              },
            ];
        if (useForAllChats && systemMessage) {
          prevChats = [
            { role: "system", content: systemMessage },
            ...prevChats,
          ];
        }
        await fetchResults(
          prevChats,
          selectedModal,
          signal,
          handleOnData,
          handleOnCompletion
        );
      } catch (error) {
        if (error instanceof Error || typeof error === "string") {
          if (mounted) handleOnError(error);
        }
      }
    })();
    return () => {
      controller.abort();
      mounted = false;
    };
  }, [
    query,
    addChat,
    index,
    scrollToBottom,
    chat.content,
    chat.id,
    sendHistory,
    selectedModal,
    systemMessage,
    useForAllChats,
  ]);

  return { query, result, error, isStreamCompleted, cursorRef };
}
