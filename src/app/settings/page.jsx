import SettingsClient from "./SettingsClient";
import { fetchProfile } from "./fetchProfile";

export default async function SettingsPage() {
  const profile = await fetchProfile();
  return <SettingsClient profile={profile} />;
}
