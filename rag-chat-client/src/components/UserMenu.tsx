"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import styled from "@emotion/styled";
import { useUser } from "@/context/UserContext";
import { User as UserIcon } from "lucide-react";
import { User } from "@/api/user.api";

const Container = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.border};
  background: none;
  padding: 0;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: 3rem;
  width: 18rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.background};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 50;
`;

const Section = styled.div`
  margin-top: 1.5rem;
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ThemeToggleWrapper = styled.div`
  flex-shrink: 0;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  text-align: center;
`;

const SignInLink = styled.a`
  margin-top: 1rem;
  padding: 8px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.subtleText};
    color: ${({ theme }) => theme.background};
  }
`;

const SignOutLink = styled.button`
  margin-top: 1rem;
  padding: 8px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.subtleText};
    color: ${({ theme }) => theme.background};
  }
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text}; // Optional: use theme color
`;

const UserEmail = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText}; // Use a themed subtle text color
`;

export const UserMenu = () => {
  const { isLoading, user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Container ref={ref}>
      {isLoading ? null : user ? (
        <AvatarButton onClick={() => setOpen(!open)}>
          <img src={user.avatarUrl || "/default-avatar.png"} alt={user.name} />
        </AvatarButton>
      ) : (
        <ToggleButton onClick={() => setOpen(!open)}>
          Sign in <UserIcon size={16} />
        </ToggleButton>
      )}

      {open && (
        <Panel>
          {user ? (
            <>
              <div style={{ textAlign: "center" }}>
                <Image
                  src={user.avatarUrl || "/default-avatar.png"}
                  alt="avatar"
                  width={80}
                  height={80}
                  style={{ borderRadius: "50%", marginBottom: 8 }}
                />
                <UserName style={{ fontWeight: 600 }}>{user.name}</UserName>
                <UserEmail style={{ fontSize: 14, color: "#888" }}>
                  {user.email}
                </UserEmail>
              </div>
              <Section>
                <Row>
                  <span>Theme</span>
                  <ThemeToggleWrapper>
                    <ThemeToggle />
                  </ThemeToggleWrapper>
                </Row>
              </Section>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <SignOutLink onClick={handleSignOut}>Sign Out</SignOutLink>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Image
                  src="/logo.svg"
                  alt="logo"
                  width={120}
                  height={120}
                  style={{ marginBottom: 1 }}
                />
                <Description>
                  Create an account or sign in to keep all your conversations
                  and to generate images
                </Description>
                <SignInLink href={`${process.env.BASE_URL}/api/v1/auth/google`}>
                  Sign in
                </SignInLink>
              </div>
              <Section>
                <Row>
                  <span>Theme</span>
                  <ThemeToggleWrapper>
                    <ThemeToggle />
                  </ThemeToggleWrapper>
                </Row>
              </Section>
            </>
          )}
        </Panel>
      )}
    </Container>
  );
};
