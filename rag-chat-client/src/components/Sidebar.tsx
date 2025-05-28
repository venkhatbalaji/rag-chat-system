"use client";

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Binoculars,
  FlaskConical,
  GalleryHorizontal,
  GalleryHorizontalEnd,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";

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

export const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading } = useUser();
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
        <Header expanded={expanded}>
          <Logo>
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          </Logo>
          <BrandName show={expanded}>RAVEN</BrandName>
        </Header>
        {navItems.map(({ label, path, icon }) => (
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
      </SidebarWrapper>
      {expanded && isMobile && <MobileOverlay onClick={toggle} />}
    </>
  );
};
