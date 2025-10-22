import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default apiClient;
