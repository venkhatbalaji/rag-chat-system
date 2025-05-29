import { Session } from "@/api/session.api";
import { useQuery } from "@tanstack/react-query";

export interface SessionType {
  _id: string;
  title: string;
  isFavorite: boolean;
  createdA: string;
  updatedAt: string;
}

export const useSession = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ["session", "list"],
    queryFn: async () => {
      const res = await Session.list();
      return res as SessionType[];
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
