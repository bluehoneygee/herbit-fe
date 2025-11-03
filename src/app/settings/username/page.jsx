import UsernameClient from "./UsernameClient";
import { fetchProfile } from "../fetchProfile";

function normalizeUsername(username) {
  if (!username || typeof username !== "string") return "";
  const trimmed = username.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("@")) {
    return trimmed.slice(1).trim().toLowerCase();
  }
  return trimmed.replace(/\s+/g, "").toLowerCase();
}

export default async function UsernameSettingsPage() {
  const profile = await fetchProfile();
  const normalized = normalizeUsername(profile?.username ?? "");
  return <UsernameClient currentUsername={normalized} />;
}
