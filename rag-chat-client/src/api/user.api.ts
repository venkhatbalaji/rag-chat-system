import { axiosInstance } from "./config";
import urls from "./urls";

export class User {
  static async me() {
    try {
      const response = await axiosInstance.get(urls.user.me);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  static async login() {
    try {
      const response = await axiosInstance.get(urls.google.login);
      return response.data;
    } catch (e) {
      return null;
    }
  }
}
