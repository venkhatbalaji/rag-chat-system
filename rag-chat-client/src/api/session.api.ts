import { axiosInstance } from "./config";
import urls from "./urls";

export class Session {
  static async list() {
    try {
      const response = await axiosInstance.get(urls.session.list);
      return response.data?.sessions || [];
    } catch (e) {
      return [];
    }
  }

  static async create(data: { title: string }) {
    try {
      const response = await axiosInstance.post(urls.session.create, data);
      return response.data?.session;
    } catch (e) {
      return null;
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
