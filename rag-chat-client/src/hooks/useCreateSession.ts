import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Session } from "@/api/session.api";

export const useCreateSession = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: Session.createSession,
    onSuccess: (data: string | null | undefined) => {
      if (data) {
        router.push(`/chat/${data}`);
      } else {
        console.error("Session ID not returned");
      }
    },
    onError: (error) => {
      console.error("Failed to create session:", error);
    },
  });
};
