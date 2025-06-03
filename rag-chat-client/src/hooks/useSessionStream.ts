import { useState } from "react";
import { Session } from "@/api/session.api";

export const useSessionStream = () => {
  const [isLoading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");

  const sendMessage = async (
    sessionTitle: string,
    model: string = "deepseek-coder",
    sessionID: string
  ) => {
    setLoading(true);
    setResponseText("");

    try {
      await Session.createWithStream(
        { title: sessionTitle, sessionId: sessionID, model: model },
        (chunk) => {
          console.log("Received chunk:", chunk);
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
