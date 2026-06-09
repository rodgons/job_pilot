import { clearAuthCookies } from "@insforge/sdk/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { captureServerEvent } from "@/lib/posthog-server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const insforge = await createInsforgeServer();

  const { data: userData } = await insforge.auth.getCurrentUser();
  const userId = userData?.user?.id;

  const { error } = await insforge.auth.signOut();

  if (error) {
    console.error("[auth/logout]", error);
  }

  await captureServerEvent({
    distinctId: userId ?? crypto.randomUUID(),
    event: "signed_out",
  });

  const response = NextResponse.redirect(new URL("/", request.url));
  clearAuthCookies(response.cookies);

  return response;
}
