import { AppNavbar } from "@/components/AppNavbar";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { UserIdentifier } from "@/components/UserIdentifier";
import { createInsforgeServer, requireUser } from "@/lib/insforge-server";
import type { Profile } from "@/types/profile";

export default async function ProfilePage() {
  const user = await requireUser();
  const insforge = await createInsforgeServer();
  const { data: profile } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-background">
      <UserIdentifier userId={user.id} email={user.email} />
      <AppNavbar activeHref="/profile" showSignOut={false} />
      <ProfilePageClient
        profile={(profile as Profile | null) ?? null}
        userEmail={user.email}
      />
    </main>
  );
}
