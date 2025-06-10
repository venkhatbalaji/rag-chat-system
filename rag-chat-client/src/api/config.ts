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

async function getAxiosInstanceForServerSide() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const headers = {
    "Content-type": "application/json",
    Accept: "application/json",
    Cookie: cookieHeader,
  };
  const axiosInstance = axios.create({
    baseURL: process.env.BASE_URL,
    headers,
    withCredentials: true,
  });
  return axiosInstance;
}

export { baseUrl, axiosInstance, getAxiosInstanceForServerSide };
