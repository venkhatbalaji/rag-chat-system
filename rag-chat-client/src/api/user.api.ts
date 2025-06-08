import { axiosInstance } from "./config";
import urls from "./urls";

export class User {
  static async me() {
    try {
      const response = await axiosInstance.get(urls.user.me);
      return response.data?.user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async login() {
    try {
      const response = await axiosInstance.get(urls.google.login);
      return response.data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async logout() {
    try {
      const response = await axiosInstance.post(urls.user.logout);
      return response.data?.data?.redirectTo;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
