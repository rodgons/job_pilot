"use client";

import posthog from "posthog-js";
import type { PostHogEvent } from "@/lib/posthog-events";

function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
}

export function initPostHog() {
  const key = getPostHogKey();

  if (!key) {
    return;
  }

  posthog.init(key, {
    api_host: "/relay",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-01-30",
    advanced_disable_flags: true,
    capture_dead_clicks: false,
    capture_exceptions: true,
    disable_session_recording: true,
    disable_surveys: true,
    debug: process.env.NODE_ENV === "development",
  });
}

export function capturePostHogEvent(
  event: PostHogEvent,
  properties?: Record<string, unknown>,
) {
  posthog.capture(event, properties);
}

export function identifyPostHogUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  posthog.identify(userId, properties);
}

export function resetPostHogUser() {
  posthog.reset();
}
