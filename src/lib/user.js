//src/lib/user.js
import apiClient from "./apiClient";

export async function getMe() {
  const response = await apiClient.get("/auth/me");

  const userData = response.data?.data || response.data;
  return userData?.user || userData;
}
