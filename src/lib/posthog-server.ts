import { PostHog } from "posthog-node";
import type { PostHogEvent } from "@/lib/posthog-events";

type CaptureServerEventOptions = {
  distinctId?: string;
  event: PostHogEvent;
  properties?: Record<string, unknown>;
};

const POSTHOG_HOST = "https://us.i.posthog.com";

function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
}

export function getPostHogClient(): PostHog | null {
  const key = getPostHogKey();

  if (!key) {
    return null;
  }

  return new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function captureServerEvent({
  distinctId,
  event,
  properties,
}: CaptureServerEventOptions) {
  const posthog = getPostHogClient();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: distinctId ?? crypto.randomUUID(),
      event,
      properties,
    });
  } finally {
    await posthog.shutdown();
  }
}

export async function identifyServerUser({
  distinctId,
  properties,
}: {
  distinctId: string;
  properties?: Record<string, unknown>;
}) {
  const posthog = getPostHogClient();

  if (!posthog) {
    return;
  }

  try {
    posthog.identify({ distinctId, properties });
  } finally {
    await posthog.shutdown();
  }
}
