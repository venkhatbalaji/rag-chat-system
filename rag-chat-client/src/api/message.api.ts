import { axiosInstance, baseUrl } from "./config";
import urls from "./urls";

export class Message {
  static async list(sessionId: string) {
    try {
      const response = await axiosInstance.get(urls.chat.list(sessionId));
      return response.data?.data || [];
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  static async createWithStream(
    data: { title: string; sessionId: string },
    onData: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(
        `${baseUrl}${urls.chat.create(data?.sessionId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ title: data.title }),
          credentials: "include",
        }
      );
      if (!response.ok || !response.body) {
        throw new Error("Stream failed to start.");
      }
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = value
          .split("\n")
          .filter((line) => line.startsWith("data: "))
          .map((line) => line.replace("data: ", ""));
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed?.delta?.content) {
              onData(parsed.delta.content);
            }
          } catch (err) {
            console.error("JSON parsing error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  }
}
