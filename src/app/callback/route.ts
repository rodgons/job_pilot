import { setAuthCookies } from "@insforge/sdk/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";

const OAUTH_CODE_VERIFIER_COOKIE = "jobpilot_oauth_code_verifier";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const code = request.nextUrl.searchParams.get("insforge_code");
    const oauthError = request.nextUrl.searchParams.get("error");
    const codeVerifier = request.cookies.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;

    if (oauthError || !code || !codeVerifier) {
      await captureServerEvent({
        event: "sign_in_failed",
        properties: { reason: "missing_params" },
      });
      return NextResponse.redirect(
        new URL("/login?error=callback", request.url),
      );
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.exchangeOAuthCode(
      code,
      codeVerifier,
    );

    if (error || !data?.accessToken) {
      console.error("[auth/callback]", error);
      await captureServerEvent({
        event: "sign_in_failed",
        properties: { reason: "exchange_failed" },
      });
      return NextResponse.redirect(
        new URL("/login?error=callback", request.url),
      );
    }

    await identifyServerUser({
      distinctId: data.user.id,
      properties: data.user.email ? { email: data.user.email } : undefined,
    });
    await captureServerEvent({
      distinctId: data.user.id,
      event: "sign_in_completed",
      properties: { provider: data.user.providers?.at(0) },
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    response.cookies.delete(OAUTH_CODE_VERIFIER_COOKIE);

    return response;
  } catch (error) {
    console.error("[auth/callback]", error);
    await captureServerEvent({
      event: "sign_in_failed",
      properties: { reason: "unexpected_error" },
    });
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }
}
