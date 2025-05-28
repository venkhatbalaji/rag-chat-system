import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const THEME_QUERY_KEY = ["theme"];

export const useTheme = () => {
  return useQuery({
    queryKey: THEME_QUERY_KEY,
    queryFn: async () => {
      if (typeof window === "undefined") return "light";
      return localStorage.getItem("theme") || "light";
    },
    staleTime: Infinity,
    initialData: "light",
  });
};

export const useSetTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (theme: "light" | "dark") => {
      localStorage.setItem("theme", theme);
      return theme;
    },
    onSuccess: (theme) => {
      queryClient.setQueryData(["theme"], theme);
    },
  });
};
