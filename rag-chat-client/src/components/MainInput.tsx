"use client";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { useUser } from "@/context/UserContext";

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
  margin-bottom: 3rem;
`;

const ChatWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 1rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  max-width: 700px;
  width: 100%;
  gap: 12px;
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
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Send message:", message);
    setMessage("");
  };

  return (
    <Container>
      <Greeting>
        {user
          ? `Hi ${user.name}, what should we dive into today?`
          : "Hi there, what should we dive into today?"}
      </Greeting>

      <ChatWrapper theme={theme}>
        <Input
          placeholder="Message Copilot"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <SendButton onClick={handleSend} aria-label="Send message">
          <SendHorizonal />
        </SendButton>
      </ChatWrapper>
    </Container>
  );
};
