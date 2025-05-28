"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  isError: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isError } = useAuth();

  return (
    <UserContext.Provider value={{ user: user || null, isLoading, isError }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
