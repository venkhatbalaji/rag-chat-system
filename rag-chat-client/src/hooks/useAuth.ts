import { User } from "@/api/user.api";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await User.me();
      return res;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
