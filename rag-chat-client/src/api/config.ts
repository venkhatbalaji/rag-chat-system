import axios, { AxiosInstance } from "axios";

const baseUrl: string | undefined = process.env.BASE_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

export { baseUrl, axiosInstance };
