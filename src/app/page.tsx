import Image from "next/image";
import { FindFirstMatchLink } from "@/components/FindFirstMatchLink";
import { GetStartedLink } from "@/components/GetStartedLink";
import { getCurrentUser } from "@/lib/insforge-server";
import agentLogImage from "../../public/images/agnet-log.png";
import dashboardDemoImage from "../../public/images/dashboard-demo.png";
import jobsListImage from "../../public/images/jobs-lists.png";
import userIconImage from "../../public/images/user-icon.png";
import logoImage from "../../public/logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

const leftFeatures = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    highlighted: true,
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const rightFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    highlighted: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

function Logo() {
  return (
    <a className="inline-flex items-center" href="/" aria-label="JobPilot home">
      <Image
        src={logoImage}
        alt="JobPilot"
        width={124}
        height={42}
        className="h-[28px] w-auto"
        priority
      />
    </a>
  );
}

function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="border-border border-b bg-surface">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <a
              className="font-medium text-sm text-text-dark transition-colors hover:text-text-primary"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <GetStartedLink
          className="landing-button-primary min-h-9 px-5 py-2"
          href={isAuthenticated ? "/dashboard" : "/login"}
        >
          Start for free
        </GetStartedLink>
      </div>
    </header>
  );
}

function ActionButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <GetStartedLink
        className="landing-button-primary"
        href={isAuthenticated ? "/dashboard" : "/login"}
      >
        Get Started <span aria-hidden="true">▶</span>
      </GetStartedLink>
      <FindFirstMatchLink className="landing-button-secondary" />
    </div>
  );
}

function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="landing-panel overflow-hidden rounded-none">
      <div className="landing-hero-glow border-border border-b px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
        <h1 className="mx-auto max-w-[760px] font-semibold text-[clamp(2.5rem,5.7vw,4.35rem)] text-text-slate leading-[0.96]">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-6 max-w-[610px] text-base text-text-secondary leading-7">
          Stop applying blind. JobPilot finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <ActionButtons isAuthenticated={isAuthenticated} />
      </div>

      <div className="bg-surface-tertiary px-5 pt-12 pb-14 sm:px-12">
        <div className="landing-browser-shadow mx-auto max-w-[1030px] overflow-hidden rounded-[26px]">
          <Image
            src={dashboardDemoImage}
            alt="JobPilot dashboard preview"
            sizes="(min-width: 1024px) 1030px, 92vw"
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function FeatureList({
  items,
  accent,
}: {
  items: typeof leftFeatures;
  accent: "accent" | "success";
}) {
  const accentClass = accent === "success" ? "border-success" : "border-accent";

  return (
    <div>
      {items.map((item) => (
        <div
          className="border-border border-b px-9 py-7 last:border-b-0 sm:px-12 lg:px-16"
          key={item.title}
        >
          <div
            className={item.highlighted ? `border-l-2 ${accentClass} pl-5` : ""}
          >
            <h3 className="font-semibold text-lg text-text-primary">
              {item.title}
            </h3>
            <p className="mt-3 max-w-[520px] text-base text-text-secondary leading-7">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobsFeature() {
  return (
    <section className="landing-panel grid overflow-hidden lg:grid-cols-[1fr_1fr]">
      <div className="border-border border-b lg:border-r lg:border-b-0">
        <div className="px-9 py-12 sm:px-12 lg:px-16 lg:py-16">
          <h2 className="max-w-[420px] font-semibold text-[clamp(2.15rem,4.6vw,3.45rem)] text-text-slate leading-[1.02]">
            Manage Your Job Search With Ease
          </h2>
        </div>
        <FeatureList accent="accent" items={leftFeatures} />
      </div>
      <div className="flex items-center justify-center bg-surface-muted px-6 py-12 sm:px-12">
        <div className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_22px_70px_color-mix(in_srgb,var(--color-info)_16%,transparent)]">
          <Image
            src={jobsListImage}
            alt="Matched jobs list"
            sizes="(min-width: 1024px) 520px, 90vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

function ConfidenceFeature() {
  return (
    <section className="landing-panel grid overflow-hidden lg:grid-cols-[1fr_1fr]">
      <div className="flex items-center justify-center border-border border-b bg-surface-muted px-6 py-14 sm:px-12 lg:border-r lg:border-b-0">
        <div className="max-w-[520px] overflow-hidden rounded-[24px] shadow-[0_22px_70px_color-mix(in_srgb,var(--color-overlay)_12%,transparent)]">
          <Image
            src={agentLogImage}
            alt="JobPilot agent log"
            sizes="(min-width: 1024px) 520px, 90vw"
            className="h-auto w-full"
          />
        </div>
      </div>
      <div>
        <div className="px-9 py-12 sm:px-12 lg:px-16 lg:py-16">
          <h2 className="max-w-[520px] font-semibold text-[clamp(2.15rem,4.6vw,3.45rem)] text-text-slate leading-[1.02]">
            Apply With More Confidence, Every Time
          </h2>
        </div>
        <FeatureList accent="success" items={rightFeatures} />
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="landing-panel px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-24">
      <p className="font-semibold text-accent text-xs uppercase tracking-[0.22em]">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[860px] font-medium text-[clamp(2rem,4vw,3.1rem)] text-text-slate leading-[1.18]">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.&rdquo;
      </blockquote>
      <div className="mt-9 flex items-center justify-center gap-3">
        <Image
          src={userIconImage}
          alt="Tom Wilson"
          width={44}
          height={44}
          className="rounded-full"
        />
        <div className="text-left">
          <p className="font-semibold text-sm text-text-primary">Tom Wilson</p>
          <p className="text-sm text-text-secondary">Junior Developer</p>
        </div>
      </div>
    </section>
  );
}

function BottomCta({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="landing-panel landing-hero-glow px-6 py-16 text-center sm:px-10 lg:px-16 lg:py-20">
      <h2 className="mx-auto max-w-[820px] font-semibold text-[clamp(2.35rem,5.4vw,4.25rem)] text-text-slate leading-[0.98]">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p className="mx-auto mt-7 max-w-[650px] text-base text-text-secondary leading-7">
        Set up your profile, upload your resume, and start finding matches in
        minutes.
      </p>
      <ActionButtons isAuthenticated={isAuthenticated} />
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-border border-x border-b bg-surface">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-8">
          <a
            className="font-medium text-sm text-text-secondary hover:text-text-primary"
            href="/dashboard"
          >
            Dashboard
          </a>
          <a
            className="font-medium text-sm text-text-secondary hover:text-text-primary"
            href="/privacy"
          >
            Privacy Policy
          </a>
          <a
            className="font-medium text-sm text-text-secondary hover:text-text-primary"
            href="/terms"
          >
            Terms &amp; Condition
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);

  return (
    <main className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
        <Hero isAuthenticated={isAuthenticated} />
        <div className="landing-divider" />
        <JobsFeature />
        <div className="landing-divider" />
        <ConfidenceFeature />
        <div className="landing-divider" />
        <Testimonial />
        <div className="landing-divider" />
        <BottomCta isAuthenticated={isAuthenticated} />
        <div className="landing-divider" />
        <Footer />
      </div>
    </main>
  );
}
