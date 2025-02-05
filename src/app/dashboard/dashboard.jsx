import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>You need to sign in to access this page.</p>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard, {session.user.email}!</h1>
      <p>This is a protected route.</p>
    </div>
  );
}
