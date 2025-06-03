"use client";

import { useParams, useSearchParams } from "next/navigation";
import { MessageType, SenderType, useMessages } from "@/hooks/useMessages";
import { useUser } from "@/context/UserContext";
import styled from "@emotion/styled";
import BirdCubeLoader from "./loader/BirdCubeLoader";
import { useEffect, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { useTheme } from "@emotion/react";
import { useSessionById } from "@/hooks/useSessionById";
import { useSessionStream } from "@/hooks/useSessionStream";
import { useSession } from "@/hooks/useSession";
import { TypingDots } from "./loader/TypingDots";
import { ModelSelector } from "./ModelSelector";

const CenteredContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

// Page background wrapper
const PageWrapper = styled.div`
  background: ${({ theme }) => theme.secondaryBackground};
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

// Main chat container
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
`;

// Bubble style per sender type
const MessageBubble = styled.div<{ sender: SenderType }>`
  margin-bottom: 1rem;
  align-self: ${({ sender }) =>
    sender === SenderType.USER ? "flex-end" : "flex-start"};
  background-color: ${({ sender, theme }) =>
    sender === SenderType.USER
      ? theme.chatBubble.user
      : theme.chatBubble.agent};
  color: #111;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 70%;
  font-size: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// Paragraph inside the bubble
const Paragraph = styled.p`
  margin: 0;
`;

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 700px;
  width: 100%;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => theme.border};
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: ${({ theme }) => theme.text};
`;

const SendButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    45deg,
    #ff6ec4,
    #7873f5,
    #4ade80,
    #facc15,
    #ff6ec4
  );
  background-size: 400% 400%;
  animation: gradientRotate 3s ease infinite;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  svg {
    color: white;
    width: 18px;
    height: 18px;
  }

  @keyframes gradientRotate {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  flex: 1;
  gap: 1.5rem;
`;

const ChatSessionPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const modelType = searchParams.get("model");
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(modelType || "deep-seek");
  const { user, isLoading } = useUser();
  const { refetchSessions } = useSession();
  const [localMessages, setLocalMessages] = useState<MessageType[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<MessageType | null>(
    null
  );

  const { data: session, isLoading: sessionIdLoading } = useSessionById(
    id as string,
    !!user && !isLoading
  );
  const {
    data: sessionMessages = [],
    isLoading: messageLoading,
    refetch,
  } = useMessages(id as string, !!user && !isLoading);
  const {
    isLoading: isMessageLoading,
    sendMessage,
    responseText,
  } = useSessionStream();
  useEffect(() => {
    if (!sessionIdLoading && session && session?.triggered === false) {
      setLocalMessages([
        {
          sender: SenderType.USER,
          content: session.title,
          _id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ]);
      sendMessage(session.title, selectedModel, id as string);
      refetchSessions();
      refetch();
    }
  }, [session, id, sessionIdLoading]);
  useEffect(() => {
    if (!responseText) return;
    setStreamingMessage({
      sender: SenderType.AGENT,
      content: responseText,
      _id: "streaming-agent-msg",
      createdAt: new Date().toISOString(),
    });
  }, [responseText]);
  useEffect(() => {
    if (!isMessageLoading && streamingMessage) {
      setLocalMessages((prev) => [...prev, streamingMessage]);
      setStreamingMessage(null);
    }
  }, [isMessageLoading]);
  const handleSend = () => {
    if (!message.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        sender: SenderType.USER,
        content: message,
        _id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ]);
    sendMessage(message, selectedModel, id as string);
    setMessage("");
  };
  return (
    <PageWrapper>
      <MainColumn>
        {messageLoading ? (
          <CenteredContent>
            <BirdCubeLoader />
          </CenteredContent>
        ) : (
          <>
            <ChatContainer>
              {[
                ...sessionMessages,
                ...localMessages,
                ...(streamingMessage ? [streamingMessage] : []),
              ].map((msg, i) => (
                <MessageBubble key={msg._id || i} sender={msg.sender}>
                  {Array.isArray(msg.content) ? (
                    msg.content.map((c: any, j: number) => (
                      <Paragraph key={j}>{c.content}</Paragraph>
                    ))
                  ) : (
                    <Paragraph>{msg.content}</Paragraph>
                  )}
                </MessageBubble>
              ))}
              {isMessageLoading && streamingMessage === null && <TypingDots />}
            </ChatContainer>
            <ChatWrapper>
              <InputRow theme={theme}>
                <ModelSelector onModelChange={(id) => setSelectedModel(id)} />
                <Input
                  placeholder="Message Raven..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <SendButton onClick={handleSend} aria-label="Send message">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <SendHorizonal />
                  )}
                </SendButton>
              </InputRow>
            </ChatWrapper>
          </>
        )}
      </MainColumn>
    </PageWrapper>
  );
};

export default ChatSessionPage;
