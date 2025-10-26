import AktivitasView from "./view";

export default async function AktivitasPage({ params }) {
  const { username } = await params;
  return <AktivitasView username={username} />;
}
