import EmailClient from "./EmailClient";
import { fetchProfile } from "../fetchProfile";

export default async function EmailSettingsPage() {
  const profile = await fetchProfile();
  const currentEmail = profile?.email ?? "";

  return <EmailClient currentEmail={currentEmail} />;
}
