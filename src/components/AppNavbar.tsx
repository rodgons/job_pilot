import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "@/components/SignOutButton";
import logoImage from "../../public/logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function AppNavbar() {
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
              className="font-medium text-sm text-text-dark transition-colors hover:text-text-primary"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton className="landing-button-secondary min-h-9 px-5 py-2" />
      </div>
    </header>
  );
}
