import { Message } from "@/api/message.api";
import { useQuery } from "@tanstack/react-query";

export interface MessageType {
  _id: string;
  content: string;
  sender: SenderType;
  createdAt: string;
}

export enum SenderType {
  USER = "user",
  AGENT = "agent",
}

export const useMessages = (sessionId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["message", "list"],
    queryFn: async () => {
      const res = await Message.list(sessionId);
      return res as MessageType[];
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
