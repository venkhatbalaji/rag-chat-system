import { axiosInstance, baseUrl } from "./config";
import urls from "./urls";

export class Session {
  static async list() {
    try {
      const response = await axiosInstance.get(urls.session.list);
      return response.data?.data || [];
    } catch (e) {
      return [];
    }
  }

  static async sessionById(sessionId: string) {
    try {
      const response = await axiosInstance.get(urls.session.byId(sessionId));
      return response.data?.data || [];
    } catch (e) {
      return [];
    }
  }

  static async createSession(data: {
    title: string;
  }): Promise<string | null | undefined> {
    try {
      const response = await axiosInstance.post(urls.session.create, {
        title: data.title,
      });
      return response.data?.data || null;
    } catch (error) {
      console.error("Streaming error:", error);
    }
  }

  static async createWithStream(
    data: { title: string; sessionId: string; model: string },
    onData: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}${urls.session.stream}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          title: data.title,
          sessionId: data.sessionId,
          modelType: data.model,
        }),
        credentials: "include",
      });
      if (!response.ok || !response.body) {
        throw new Error("Stream failed to start.");
      }
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        const { value, done } = await reader.read();
        console.log("Received value:", value);
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

  static async delete(id: string) {
    try {
      const response = await axiosInstance.delete(urls.session.delete(id));
      return response.data?.success || false;
    } catch (e) {
      return false;
    }
  }

  static async update(
    id: string,
    data: { title?: string; description?: string }
  ) {
    try {
      const response = await axiosInstance.put(urls.session.update(id), data);
      return response.data?.session;
    } catch (e) {
      return null;
    }
  }
}
