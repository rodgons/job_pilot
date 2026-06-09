"use client";

import { resetPostHogUser } from "@/lib/posthog-client";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = () => {
    resetPostHogUser();
  };

  return (
    <a className={className} href="/api/auth/logout" onClick={handleSignOut}>
      Sign out
    </a>
  );
}
