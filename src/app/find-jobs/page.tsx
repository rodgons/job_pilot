import { ProtectedPageShell } from "@/components/ProtectedPageShell";
import { SetUpProfileLink } from "@/components/SetUpProfileLink";
import { requireUser } from "@/lib/insforge-server";

export default async function FindJobsPage() {
  const user = await requireUser();

  return (
    <ProtectedPageShell
      title="Find Jobs"
      description="You are signed in to JobPilot."
      user={user}
    >
      <SetUpProfileLink className="landing-button-primary" />
    </ProtectedPageShell>
  );
}
