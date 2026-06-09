"use client";

import type { ReactNode } from "react";
import { capturePostHogEvent } from "@/lib/posthog-client";

type GetStartedLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function GetStartedLink({
  href,
  className,
  children,
}: GetStartedLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => capturePostHogEvent("get_started_clicked", { href })}
    >
      {children}
    </a>
  );
}
