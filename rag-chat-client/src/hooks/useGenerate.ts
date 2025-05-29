import { useMutation } from "@tanstack/react-query";
import { Session } from "@/api/session.api";

type GeneratePayload = {
  title: string;
};

export const useGenerate = () => {
  return useMutation({
    mutationFn: async ({ title }: GeneratePayload) => {
      const res = await Session.create({ title });
      return res;
    },
  });
};
