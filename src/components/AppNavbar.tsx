"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/SignOutButton";
import logoImage from "../../public/logo.png";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 16 16"
      >
        <rect
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          width="4"
          x="2.25"
          y="2.25"
        />
        <rect
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          width="4"
          x="9.75"
          y="2.25"
        />
        <rect
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          width="4"
          x="2.25"
          y="9.75"
        />
        <rect
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
          width="4"
          x="9.75"
          y="9.75"
        />
      </svg>
    ),
  },
  {
    label: "Find Jobs",
    href: "/find-jobs",
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 16 16"
      >
        <circle
          cx="7"
          cy="7"
          r="4.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m10.25 10.25 3 3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 16 16"
      >
        <circle
          cx="8"
          cy="5.25"
          r="2.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4.25 13.25c.55-2 2-3.25 3.75-3.25s3.2 1.25 3.75 3.25"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

type AppNavbarProps = {
  activeHref?: string;
  showSignOut?: boolean;
};

export function AppNavbar({ activeHref, showSignOut = true }: AppNavbarProps) {
  const pathname = usePathname();
  const currentHref = activeHref ?? pathname;

  return (
    <header className="border-border border-b bg-surface">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          className="inline-flex items-center"
          href="/"
          aria-label="JobPilot home"
        >
          <Image
            src={logoImage}
            alt="JobPilot"
            width={124}
            height={42}
            className="h-[28px] w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              className={`inline-flex h-16 items-center gap-2 border-b-2 font-medium text-sm transition-colors ${
                currentHref === item.href
                  ? "border-accent text-accent"
                  : "border-transparent text-text-dark hover:text-text-primary"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        {showSignOut ? (
          <SignOutButton className="landing-button-secondary min-h-9 px-5 py-2" />
        ) : (
          <div className="hidden w-[92px] md:block" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
