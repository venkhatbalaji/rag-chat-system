"use client";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useState, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useSessionStream } from "@/hooks/useSessionStream";
import { useCreateSession } from "@/hooks/useCreateSession";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  background: ${({ theme }) => theme.secondaryBackground};
`;

const Greeting = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.text};
  margin-bottom: 2rem;
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

export const MainInput = () => {
  const { user } = useUser();
  const theme = useTheme();
  const [message, setMessage] = useState("");

  const { mutate: createSession, isPending } = useCreateSession();

  const handleSend = () => {
    if (!message.trim()) return;
    createSession({ title: message.trim() });
    setMessage("");
  };

  return (
    <Container>
      <Greeting>
        {user
          ? `Hi ${user.name}, what should we dive into today?`
          : "Hi there, what should we dive into today?"}
      </Greeting>

      <ChatWrapper>
        <InputRow theme={theme}>
          <Input
            placeholder="Message Raven..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <SendButton onClick={handleSend} aria-label="Send message">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SendHorizonal />
            )}
          </SendButton>
        </InputRow>
      </ChatWrapper>
    </Container>
  );
};
