"use client";

import { capturePostHogEvent } from "@/lib/posthog-client";

type FindFirstMatchLinkProps = {
  className?: string;
};

export function FindFirstMatchLink({ className }: FindFirstMatchLinkProps) {
  return (
    <a
      className={className}
      href="/find-jobs"
      onClick={() => capturePostHogEvent("find_first_match_clicked")}
    >
      Find Your First Match
    </a>
  );
}
