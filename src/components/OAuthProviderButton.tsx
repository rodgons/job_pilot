"use client";

import { capturePostHogEvent } from "@/lib/posthog-client";

type OAuthProviderButtonProps = {
  href: string;
  label: string;
  mark: string;
  provider: string;
};

export function OAuthProviderButton({
  href,
  label,
  mark,
  provider,
}: OAuthProviderButtonProps) {
  return (
    <a
      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 font-medium text-sm text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] transition-colors hover:border-accent hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      href={href}
      onClick={() => capturePostHogEvent("oauth_sign_in_clicked", { provider })}
    >
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-full border border-border bg-surface-secondary font-semibold text-text-dark text-xs"
      >
        {mark}
      </span>
      {label}
    </a>
  );
}
