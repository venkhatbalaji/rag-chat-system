"use client";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@emotion/react";
import { GlobalStyles } from "./GlobalStyles";
import { Sidebar } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";
import { darkTheme, lightTheme } from "@/components/theme";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";

const queryClient = new QueryClient();

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

function AppShell({ children }: { children: React.ReactNode }) {
  const { data: currentTheme } = useTheme();
  const isDark = currentTheme === "dark";
  const { expanded } = useSidebar();
  const cssVars: Record<string, string> = {
    "--bg": isDark ? darkTheme.background : lightTheme.background,
    "--text": isDark ? darkTheme.text : lightTheme.text,
    "--code-bg": isDark ? "#2d2d2d" : "#f3f4f6",
    "--pre-bg": isDark ? "#1e1e1e" : "#f3f4f6",
    "--pre-text": isDark ? "#dcdcdc" : "#111111",
  };
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyles />
      <div
        style={{
          display: "flex",
          background: isDark
            ? darkTheme.secondaryBackground
            : lightTheme.secondaryBackground,
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            marginLeft: expanded ? "280px" : "80px",
            transition: "margin-left 0.3s ease-in-out",
            position: "relative",
            ...cssVars
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "1rem",
              position: "sticky",
              top: 0,
              zIndex: 999,
            }}
          >
            <UserMenu />
          </div>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <UserProvider>
              <AppShell>{children}</AppShell>
            </UserProvider>
          </SidebarProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
