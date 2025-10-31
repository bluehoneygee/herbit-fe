import RewardsView from "./rewards-view";

export default async function RewardsPage({ params }) {
  const { username } = await params;
  return <RewardsView username={username} />;
}
