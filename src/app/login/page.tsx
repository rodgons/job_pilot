import Image from "next/image";
import Link from "next/link";

import { OAuthProviderButton } from "@/components/OAuthProviderButton";
import logoImage from "../../../public/logo.png";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-[430px] rounded-xl border border-border bg-surface p-8 shadow-[0_24px_70px_color-mix(in_srgb,var(--color-overlay)_10%,transparent)]">
        <div className="flex justify-center">
          <Link href="/" aria-label="JobPilot home">
            <Image
              src={logoImage}
              alt="JobPilot"
              width={132}
              height={45}
              className="h-[30px] w-auto"
              priority
            />
          </Link>
        </div>

        <div className="mt-9 text-center">
          <h1 className="font-semibold text-3xl text-text-slate">
            Welcome back
          </h1>
          <p className="mt-3 text-sm text-text-secondary leading-6">
            Sign in to continue your job search from the dashboard.
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-error text-sm">
            We could not complete sign in. Please try again.
          </p>
        ) : null}

        <div className="mt-8 space-y-3">
          <OAuthProviderButton
            href="/api/auth/oauth/google"
            label="Continue with Google"
            mark="G"
            provider="google"
          />
          <OAuthProviderButton
            href="/api/auth/oauth/github"
            label="Continue with GitHub"
            mark="GH"
            provider="github"
          />
        </div>

        <p className="mt-7 text-center text-sm text-text-secondary">
          New users are created automatically after OAuth sign in.
        </p>
      </section>
    </main>
  );
}
