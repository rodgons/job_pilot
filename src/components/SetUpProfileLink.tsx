"use client";

import { capturePostHogEvent } from "@/lib/posthog-client";

type SetUpProfileLinkProps = {
  className?: string;
};

export function SetUpProfileLink({ className }: SetUpProfileLinkProps) {
  return (
    <a
      className={className}
      href="/profile"
      onClick={() => capturePostHogEvent("set_up_profile_clicked")}
    >
      Set up profile
    </a>
  );
}
