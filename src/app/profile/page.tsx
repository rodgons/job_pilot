import { ProtectedPageShell } from "@/components/ProtectedPageShell";
import { requireUser } from "@/lib/insforge-server";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <ProtectedPageShell
      title="Profile"
      description="You are signed in to JobPilot."
      user={user}
    >
      <p className="rounded-md border border-info-light bg-info-lightest px-4 py-3 text-info-foreground text-sm">
        Authenticated user: {user.email ?? user.id}
      </p>
    </ProtectedPageShell>
  );
}
