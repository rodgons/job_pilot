import {
  type CookieOptions,
  type CookieStore,
  updateSession,
} from "@insforge/sdk/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getInsforgeConfig } from "@/lib/insforge-config";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

class ProxyCookieStore implements CookieStore {
  constructor(
    private readonly getCookie: (
      name: string,
    ) => { value?: string } | undefined,
    private readonly setCookie: (
      name: string,
      value: string,
      options?: CookieOptions,
    ) => unknown,
    private readonly deleteCookie: (name: string) => unknown,
  ) {}

  get(name: string): { value?: string } | undefined {
    return this.getCookie(name);
  }

  set(name: string, value: string, options?: CookieOptions): unknown;
  set(options: { name: string; value: string } & CookieOptions): unknown;
  set(
    nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
    options?: CookieOptions,
  ): unknown {
    if (typeof nameOrOptions === "string") {
      if (typeof value !== "string") {
        return undefined;
      }

      return this.setCookie(nameOrOptions, value, options);
    }

    return this.setCookie(
      nameOrOptions.name,
      nameOrOptions.value,
      nameOrOptions,
    );
  }

  delete(name: string): unknown;
  delete(options: { name: string } & CookieOptions): unknown;
  delete(nameOrOptions: string | ({ name: string } & CookieOptions)): unknown {
    const name =
      typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;

    return this.deleteCookie(name);
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const requestCookies = new ProxyCookieStore(
    (name) => request.cookies.get(name),
    (name, value) => request.cookies.set(name, value),
    (name) => request.cookies.delete(name),
  );
  const responseCookies = new ProxyCookieStore(
    (name) => response.cookies.get(name),
    (name, value, options) => response.cookies.set(name, value, options),
    (name) => response.cookies.delete(name),
  );

  const session = await updateSession({
    ...getInsforgeConfig(),
    requestCookies,
    responseCookies,
  });

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !session.accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && session.accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/find-jobs/:path*",
    "/login",
  ],
};
