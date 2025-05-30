import { useState } from "react";
import { Message } from "@/api/message.api";

export const useMessageStream = () => {
  const [isLoading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  const sendMessage = async (sessionId: string, sessionTitle: string) => {
    setLoading(true);
    setResponseText("");
    try {
      await Message.createWithStream(
        { title: sessionTitle, sessionId: sessionId },
        (chunk) => {
          setResponseText((prev) => prev + chunk);
        }
      );
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    responseText,
    sendMessage,
  };
};
