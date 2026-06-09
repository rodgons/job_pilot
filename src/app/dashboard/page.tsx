import { ProtectedPageShell } from "@/components/ProtectedPageShell";
import { requireUser } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <ProtectedPageShell
      title="Dashboard"
      description="You are signed in to JobPilot."
      user={user}
    >
      <p className="rounded-md border border-success-light bg-success-lightest px-4 py-3 text-sm text-success-dark">
        Signed in as {user.email ?? user.id}
      </p>
    </ProtectedPageShell>
  );
}
