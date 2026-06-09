import { type NextRequest, NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";

const OAUTH_CODE_VERIFIER_COOKIE = "jobpilot_oauth_code_verifier";
const supportedProviders = new Set(["google", "github"]);

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { provider } = await context.params;

    if (!supportedProviders.has(provider)) {
      return NextResponse.redirect(
        new URL("/login?error=provider", request.url),
      );
    }

    const origin = request.nextUrl.origin;
    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${origin}/callback`,
      additionalParams:
        provider === "google" ? { prompt: "select_account" } : undefined,
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      console.error("[auth/oauth]", error);
      return NextResponse.redirect(new URL("/login?error=oauth", request.url));
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });

    return response;
  } catch (error) {
    console.error("[auth/oauth]", error);
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }
}
