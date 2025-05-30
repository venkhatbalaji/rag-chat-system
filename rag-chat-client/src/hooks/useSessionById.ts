import { useQuery } from "@tanstack/react-query";
import { SessionType } from "./useSession";
import { Session } from "@/api/session.api";

export const useSessionById = (sessionId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["session", "sessionById"],
    queryFn: async () => {
      const res = await Session.sessionById(sessionId);
      return res as SessionType;
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
