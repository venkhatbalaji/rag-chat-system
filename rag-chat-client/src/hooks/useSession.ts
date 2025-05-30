import { Session } from "@/api/session.api";
import { useQuery } from "@tanstack/react-query";

export interface SessionType {
  _id: string;
  title: string;
  triggered: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSession = (enabled: boolean = false) => {
  const query = useQuery({
    queryKey: ["session", "list"],
    queryFn: async () => {
      const res = await Session.list();
      return res as SessionType[];
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    refetchSessions: query.refetch,
  };
};
