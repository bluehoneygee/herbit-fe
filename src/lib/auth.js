// src/lib/auth.js
import apiClient from "./apiClient";

export async function loginApi(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data?.data?.user || data?.user;
}

export async function meApi() {
  const { data } = await apiClient.get("/auth/me"); // cookie ikut otomatis
  return data?.data || data;
}

export async function logoutApi() {
  await apiClient.post("/auth/logout");
}
