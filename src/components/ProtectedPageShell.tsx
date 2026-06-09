import type { ReactNode } from "react";

import { AppNavbar } from "@/components/AppNavbar";
import { UserIdentifier } from "@/components/UserIdentifier";

type ProtectedPageShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  user?: {
    id: string;
    email?: string;
  };
};

export function ProtectedPageShell({
  children,
  title,
  description,
  user,
}: ProtectedPageShellProps) {
  return (
    <main className="min-h-screen bg-background">
      {user ? <UserIdentifier userId={user.id} email={user.email} /> : null}
      <AppNavbar />
      <section className="mx-auto max-w-[960px] px-5 py-12 sm:px-8">
        <div className="rounded-xl border border-border bg-surface p-8 shadow-[0_18px_48px_color-mix(in_srgb,var(--color-overlay)_7%,transparent)]">
          <p className="font-semibold text-accent text-xs uppercase tracking-[0.18em]">
            JobPilot
          </p>
          <h1 className="mt-4 font-semibold text-4xl text-text-slate">
            {title}
          </h1>
          <p className="mt-4 max-w-[620px] text-base text-text-secondary leading-7">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
