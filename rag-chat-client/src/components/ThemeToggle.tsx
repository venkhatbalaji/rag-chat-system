"use client";
import styled from "@emotion/styled";
import { Moon, Sun } from "lucide-react";
import { useTheme, useSetTheme } from "@/hooks/useTheme";

const ToggleWrapper = styled.div`
  width: 48px;
  height: 26px;
  border-radius: 9999px;
  background: ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
`;

const Knob = styled.div<{ active: boolean }>`
  background: white;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: translateX(${({ active }) => (active ? "22px" : "0")});
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

export const ThemeToggle = () => {
  const { data: theme = "light" } = useTheme();
  const { mutate: setTheme } = useSetTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <ToggleWrapper onClick={toggleTheme}>
      <Knob active={isDark}>
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </Knob>
    </ToggleWrapper>
  );
};
