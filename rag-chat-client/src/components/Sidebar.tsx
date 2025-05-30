"use client";

import { isToday, isYesterday } from "date-fns";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Binoculars,
  FlaskConical,
  GalleryHorizontal,
  GalleryHorizontalEnd,
  MessageSquare,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { SessionType, useSession } from "@/hooks/useSession";
import BirdCubeLoader from "./loader/BirdCubeLoader";
import { useRouter } from "next/navigation";

const SidebarWrapper = styled.div<{ expanded: boolean }>`
  width: ${({ expanded }) => (expanded ? "280px" : "80px")};
  transition: width 0.3s ease-in-out;
  background: ${({ theme }) => theme.background};
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-right: 1px solid ${({ theme }) => theme.border};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow-x: hidden;

  @media (max-width: 768px) {
    width: ${({ expanded }) => (expanded ? "100%" : "60px")};
    padding: ${({ expanded }) => (expanded ? "16px" : "8px")};
  }
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  align-self: flex-end;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    align-self: flex-start;
  }
`;

const Header = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  opacity: ${({ expanded }) => (expanded ? 1 : 0)};
  transform: ${({ expanded }) =>
    expanded ? "translateX(0)" : "translateX(-20px)"};
  transition: all 0.3s ease-in-out;
  cursor: pointer;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const BrandName = styled.span<{ show: boolean }>`
  font-weight: 600;
  font-size: 1.1rem;
  white-space: nowrap;
  color: ${({ theme }) => theme.text};
  opacity: ${({ show }) => (show ? 1 : 0)};
  transform: ${({ show }) => (show ? "translateX(0)" : "translateX(-10px)")};
  transition: all 0.3s ease;

  @media (min-width: 768px) {
    display: inline;
  }
`;

const NavItem = styled.div<{ active?: boolean; expanded?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${({ active, theme }) =>
    active ? theme.subtleText : "transparent"};
  color: ${({ theme }) => theme.text};
  cursor: pointer;

  &:hover {
    background: ${({ theme, active }) =>
      active ? theme.subtleText : theme.hoverBackground || "#f0f0f0"};
  }
`;

const Label = styled.span<{ show: boolean }>`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transform: ${({ show }) => (show ? "translateX(0)" : "translateX(-10px)")};
  transition: all 0.25s ease-in-out;
`;

const SignInButton = styled.a`
  margin-top: 1rem;
  padding: 12px 20px;
  width: 100%;
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

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.background};
  z-index: 999;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatItem = styled.div`
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  transition: background 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    background: ${({ theme }) => theme.hoverBackground || "#f0f0f0"};
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.subtleText};
`;

const SessionTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SessionDate = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.subtleText};
`;

const SessionGroup = styled.div`
  margin-bottom: 24px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.subtleText};
  text-align: center;
  font-size: 14px;
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.6;
  }
`;

const CenteredContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const safeFormatDate = (input?: string | Date) => {
  const d = new Date(input || "");
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const Sidebar = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading } = useUser();
  const { data: chatSessions = [], isLoading: sessionsLoading } = useSession(
    !!user && !isLoading
  );
  const todaySessions = chatSessions.filter((s) =>
    isToday(new Date(s.createdAt))
  );
  const yesterDaySessions = chatSessions.filter((s) =>
    isYesterday(new Date(s.createdAt))
  );
  const previousSessions = chatSessions.filter(
    (s) =>
      !isToday(new Date(s.createdAt)) && !isYesterday(new Date(s.createdAt))
  );
  const { expanded, toggle } = useSidebar();
  const pathname = usePathname();
  const navItems = [
    { label: "Discover", icon: <Binoculars />, path: "/discover" },
    { label: "Labs", icon: <FlaskConical />, path: "/labs" },
  ];
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <>
      <SidebarWrapper expanded={expanded}>
        <ToggleButton onClick={toggle}>
          {expanded ? <GalleryHorizontalEnd /> : <GalleryHorizontal />}
        </ToggleButton>
        <Header onClick={() => router.push("/")} expanded={expanded}>
          <Logo>
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          </Logo>
          <BrandName show={expanded}>RAVEN</BrandName>
        </Header>

        {!user &&
          navItems.map(({ label, path, icon }) => (
            <NavItem
              key={label}
              active={pathname === path}
              title={label}
              expanded={expanded}
            >
              <IconWrapper>{icon}</IconWrapper>
              <Label show={expanded}>{label}</Label>
            </NavItem>
          ))}

        {!isLoading && !user && expanded && (
          <div style={{ marginTop: "auto" }}>
            {expanded && (
              <SignInButton href={`${process.env.BASE_URL}/api/v1/auth/google`}>
                Sign in
              </SignInButton>
            )}
          </div>
        )}
        {user && expanded && (
          <ChatSection>
            {sessionsLoading ? (
              <CenteredContent>
                <BirdCubeLoader />
              </CenteredContent>
            ) : (
              <>
                {todaySessions.length > 0 && (
                  <>
                    <SessionGroup>
                      <SectionTitle>Today</SectionTitle>
                      {todaySessions.map((session: SessionType) => (
                        <ChatItem
                          key={session._id}
                          onClick={() => {
                            window.location.href = `/chat/${session._id}`;
                          }}
                        >
                          <SessionTitle>
                            {session.title || "New Session"}
                          </SessionTitle>
                          <SessionDate>
                            {safeFormatDate(session.createdAt)}
                          </SessionDate>
                        </ChatItem>
                      ))}
                    </SessionGroup>
                  </>
                )}
                {yesterDaySessions.length > 0 && (
                  <>
                    <SessionGroup>
                      <SectionTitle>Yesterday</SectionTitle>
                      {yesterDaySessions.map((session: SessionType) => (
                        <ChatItem
                          key={session._id}
                          onClick={() => {
                            window.location.href = `/chat/${session._id}`;
                          }}
                        >
                          <SessionTitle>
                            {session.title || "New Session"}
                          </SessionTitle>
                          <SessionDate>
                            {safeFormatDate(session.createdAt)}
                          </SessionDate>
                        </ChatItem>
                      ))}
                    </SessionGroup>
                  </>
                )}
                {previousSessions.length > 0 && (
                  <>
                    <SessionGroup>
                      <SectionTitle>Previous Sessions</SectionTitle>
                      {previousSessions.map((session: SessionType) => (
                        <ChatItem
                          key={session._id}
                          onClick={() => {
                            window.location.href = `/chat/${session._id}`;
                          }}
                        >
                          <SessionTitle>
                            {session.title || "New Session"}
                          </SessionTitle>
                          <SessionDate>
                            {safeFormatDate(session.createdAt)}
                          </SessionDate>
                        </ChatItem>
                      ))}
                    </SessionGroup>
                  </>
                )}
                {todaySessions.length === 0 &&
                  previousSessions.length === 0 && (
                    <CenteredContent>
                      <EmptyState>
                        <MessageSquare />
                        <span>No conversations yet</span>
                      </EmptyState>
                    </CenteredContent>
                  )}
              </>
            )}
          </ChatSection>
        )}
      </SidebarWrapper>
      {expanded && isMobile && <MobileOverlay onClick={toggle} />}
    </>
  );
};
