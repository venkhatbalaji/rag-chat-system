"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext<{
  expanded: boolean;
  toggle: () => void;
}>({
  expanded: true,
  toggle: () => {},
});

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(true);
  const toggle = () => setExpanded((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ expanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
