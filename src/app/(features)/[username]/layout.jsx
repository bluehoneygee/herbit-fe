import ProfileLayoutClient from "./ProfileLayoutClient";

export default async function ProfileLayout({ children, params }) {
  const resolvedParams = await params;
  return (
    <ProfileLayoutClient params={resolvedParams}>{children}</ProfileLayoutClient>
  );
}
