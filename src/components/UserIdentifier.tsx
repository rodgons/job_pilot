"use client";

import { useEffect } from "react";
import { identifyPostHogUser } from "@/lib/posthog-client";

type UserIdentifierProps = {
  userId: string;
  email?: string;
};

export function UserIdentifier({ userId, email }: UserIdentifierProps) {
  useEffect(() => {
    identifyPostHogUser(userId, email ? { email } : undefined);
  }, [userId, email]);
  return null;
}
