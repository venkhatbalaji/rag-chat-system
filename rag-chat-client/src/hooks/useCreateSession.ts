import { useMutation } from "@tanstack/react-query";
import { Session } from "@/api/session.api";

export const useCreateSession = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (sessionId?: string | null) => void;
  onError?: (error: unknown) => void;
} = {}) => {
  return useMutation({
    mutationFn: Session.createSession,
    onSuccess,
    onError: (error) => {
      console.error("Failed to create session:", error);
      onError?.(error);
    },
  });
};
