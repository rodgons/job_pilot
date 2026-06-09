import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getInsforgeConfig } from "@/lib/insforge-config";

type AuthUser = {
  id: string;
  email?: string;
};

export async function createInsforgeServer() {
  const cookieStore = await cookies();
  const config = getInsforgeConfig();

  return createServerClient({
    ...config,
    cookies: cookieStore,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
