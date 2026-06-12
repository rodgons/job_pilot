import type { ReactNode } from "react";

import { AppNavbar } from "@/components/AppNavbar";
import { UserIdentifier } from "@/components/UserIdentifier";
import { requireUser } from "@/lib/insforge-server";

const missingFields = ["PHONE", "LOCATION", "EDUCATION"];
const skills = ["React", "TypeScript", "Next.js", "Tailwind CSS"];
const industries = ["SaaS", "Developer Tools", "AI Products"];
const roleStartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const roleYears = ["2024", "2023", "2022", "2021", "2020"];

const workRoles = [
  {
    company: "Vercel",
    title: "Frontend Engineer",
    startMonth: "Jan",
    startYear: "2022",
    endMonth: "Present",
    endYear: "Present",
    current: true,
    responsibilities:
      "Built Next.js features and optimized web vitals. Led a team of 3 developers.",
  },
  {
    company: "Linear",
    title: "UI Engineer",
    startMonth: "Mar",
    startYear: "2020",
    endMonth: "Dec",
    endYear: "2021",
    current: false,
    responsibilities:
      "Shipped product workflows, design system updates, and onboarding improvements.",
  },
  {
    company: "",
    title: "",
    startMonth: "Jan",
    startYear: "2024",
    endMonth: "Dec",
    endYear: "2024",
    current: false,
    responsibilities: "",
  },
];

const inputClass =
  "min-h-11 w-full rounded-md border border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:bg-surface";

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase leading-4 text-text-secondary";

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-overlay)_10%,transparent),0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)] sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

function TextInput({
  defaultValue,
  placeholder,
  readOnly = false,
  type = "text",
}: {
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <input
      className={inputClass}
      defaultValue={defaultValue}
      placeholder={placeholder}
      readOnly={readOnly}
      type={type}
    />
  );
}

function SelectInput({
  defaultValue,
  options,
}: {
  defaultValue: string;
  options: string[];
}) {
  return (
    <select className={inputClass} defaultValue={defaultValue}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function DateSelectPair({
  month,
  year,
  disabled = false,
}: {
  month: string;
  year: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <select className={inputClass} defaultValue={month} disabled={disabled}>
        {[
          ...roleStartMonths,
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
          "Present",
        ].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <select className={inputClass} defaultValue={year} disabled={disabled}>
        {[...roleYears, "Present"].map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SmallIcon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center ${className}`}
    >
      {children}
    </span>
  );
}

function ProfileAttentionBanner() {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * 0.7;

  return (
    <SectionCard className="border-[color-mix(in_srgb,var(--color-error)_24%,var(--color-border))] px-6 py-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[560px]">
          <div className="flex items-center gap-2">
            <SmallIcon className="text-error">
              <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M10 6.5v4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle cx="10" cy="14" fill="currentColor" r="1" />
              </svg>
            </SmallIcon>
            <h1 className="font-semibold text-2xl text-text-primary">
              Profile needs attention
            </h1>
          </div>
          <p className="mt-3 max-w-[480px] font-medium text-sm text-text-secondary leading-6">
            Complete the missing fields to improve your chance of getting
            tailored matches and generating quality resumes.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span
                className="rounded-sm bg-[color-mix(in_srgb,var(--color-error)_9%,var(--color-surface))] px-2.5 py-1 font-bold text-[11px] text-error"
                key={field}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
        <div className="relative h-32 w-32 shrink-0 self-center">
          <svg
            aria-hidden="true"
            className="-rotate-90 h-32 w-32"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="color-mix(in srgb, var(--color-error) 12%, transparent)"
              strokeWidth="9"
            />
            <circle
              cx="50"
              cy="50"
              fill="none"
              r={radius}
              stroke="var(--color-error)"
              strokeDasharray={`${progress} ${circumference - progress}`}
              strokeLinecap="round"
              strokeWidth="9"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-semibold text-3xl text-text-primary">
            70%
          </span>
        </div>
      </div>
    </SectionCard>
  );
}

function ConnectedAccounts() {
  return (
    <SectionCard>
      <div className="flex items-start gap-2">
        <SmallIcon className="text-linkedin">
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.25 6.35H2.62v8.4h2.63v-8.4ZM3.94 5.2a1.51 1.51 0 1 0 0-3.02 1.51 1.51 0 0 0 0 3.02ZM16.75 10.08c0-2.4-1.28-3.52-3-3.52a2.59 2.59 0 0 0-2.34 1.28V6.35H8.88v8.4h2.63v-4.16c0-1.1.2-2.17 1.58-2.17 1.35 0 1.37 1.27 1.37 2.24v4.09h2.29v-4.67Z" />
          </svg>
        </SmallIcon>
        <div>
          <h2 className="font-semibold text-lg text-text-primary">
            Connected Accounts
          </h2>
          <p className="mt-1 font-medium text-sm text-text-secondary">
            Connect your LinkedIn so the agent handles manual
            apply-with-LinkedIn workflows.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-border-muted text-surface">
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.25 6.35H2.62v8.4h2.63v-8.4ZM3.94 5.2a1.51 1.51 0 1 0 0-3.02 1.51 1.51 0 0 0 0 3.02ZM16.75 10.08c0-2.4-1.28-3.52-3-3.52a2.59 2.59 0 0 0-2.34 1.28V6.35H8.88v8.4h2.63v-4.16c0-1.1.2-2.17 1.58-2.17 1.35 0 1.37 1.27 1.37 2.24v4.09h2.29v-4.67Z" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-sm text-text-primary">LinkedIn</p>
            <p className="mt-1 font-medium text-text-muted text-xs">
              Not connected
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-linkedin px-5 font-semibold text-linkedin-foreground text-sm transition-opacity hover:opacity-90"
          type="button"
        >
          Connect LinkedIn
        </button>
      </div>
    </SectionCard>
  );
}

function ResumeSection() {
  return (
    <SectionCard>
      <h2 className="font-semibold text-lg text-text-primary">Resume</h2>
      <p className="mt-2 font-medium text-sm text-text-secondary leading-6">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div className="mt-7 rounded-xl border border-border-muted border-dashed bg-surface-secondary px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-accent shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_6%,transparent)]">
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 15.5V8.75m0 0-2.75 2.75M12 8.75l2.75 2.75"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <path
              d="M8.2 17.25H7.15a4.15 4.15 0 0 1-.85-8.22A5.82 5.82 0 0 1 17.55 10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
            <path
              d="M17 18.25h2m-1-1v2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
        <p className="mt-6 font-semibold text-base text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-2 font-medium text-sm text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <button
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-5 font-semibold text-sm text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:bg-surface-secondary"
          type="button"
        >
          Select Resume
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-border border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 font-semibold text-accent-foreground text-sm transition-colors hover:bg-accent-dark"
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M4.5 2.5h4L11.5 5v8.5h-7v-11Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.3"
            />
            <path d="M8.5 2.5V5h3" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M6.25 8.25h3.5M6.25 10.5h3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.3"
            />
          </svg>
          Generate Resume from Profile
        </button>
      </div>
    </SectionCard>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className="inline-flex min-h-8 items-center gap-1 rounded-md bg-surface-muted px-3 font-semibold text-sm text-text-dark"
          key={item}
        >
          {item}
          <span className="text-text-muted">x</span>
        </span>
      ))}
    </div>
  );
}

function WorkRoleCard({
  role,
  index,
}: {
  role: (typeof workRoles)[number];
  index: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-semibold text-sm text-text-primary">
          Role {index + 1}
        </p>
        {index > 0 ? (
          <button
            className="font-semibold text-error text-xs transition-colors hover:text-text-primary"
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company Name">
          <TextInput defaultValue={role.company} placeholder="Company name" />
        </Field>
        <Field label="Job Title">
          <TextInput defaultValue={role.title} placeholder="Job title" />
        </Field>
        <Field label="Start Date">
          <DateSelectPair month={role.startMonth} year={role.startYear} />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className={labelClass}>End Date</span>
            <label className="flex items-center gap-2 font-semibold text-text-secondary text-xs">
              <input
                className="h-4 w-4 accent-[var(--color-info-dark)]"
                defaultChecked={role.current}
                type="checkbox"
              />
              Currently working here
            </label>
          </div>
          <DateSelectPair
            disabled={role.current}
            month={role.endMonth}
            year={role.endYear}
          />
        </div>
        <Field className="md:col-span-2" label="Key Responsibilities">
          <textarea
            className={`${inputClass} min-h-28 resize-y py-3 leading-6`}
            defaultValue={role.responsibilities}
            placeholder="Summarize your scope, impact, and tools used."
          />
        </Field>
      </div>
    </div>
  );
}

function ProfileInformation({ email }: { email?: string }) {
  return (
    <SectionCard>
      <div>
        <h2 className="font-semibold text-2xl text-text-primary">
          Profile Information
        </h2>
        <p className="mt-2 font-medium text-sm text-text-secondary">
          This context is used to accurately represent you in agent
          interactions.
        </p>
      </div>

      <div className="mt-6 border-border border-t pt-8">
        <h3 className="font-semibold text-base text-text-primary">
          Personal Info
        </h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Full Name">
            <TextInput defaultValue="Faizan Ali" />
          </Field>
          <Field label="Email">
            <TextInput
              defaultValue={email ?? "faizan@jsmastery.pro"}
              readOnly
            />
          </Field>
          <Field label="Phone Number">
            <TextInput placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Location">
            <TextInput placeholder="City, Country" />
          </Field>
          <Field label="LinkedIn URL">
            <TextInput defaultValue="https://linkedin.com/in/faizan" />
          </Field>
          <Field label="Portfolio / Github">
            <TextInput defaultValue="https://github.com/jsmastery" />
          </Field>
          <Field label="Work Authorization">
            <SelectInput
              defaultValue="Citizen"
              options={["Citizen", "Permanent resident", "Work visa"]}
            />
          </Field>
        </div>
      </div>

      <div className="mt-10 border-border border-t pt-8">
        <h3 className="font-semibold text-base text-text-primary">
          Professional Info
        </h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field className="md:col-span-2" label="Current/Recent Job Title">
            <TextInput defaultValue="Frontend Engineer" />
          </Field>
          <Field label="Experience Level">
            <SelectInput
              defaultValue="Junior"
              options={["Junior", "Mid-level", "Senior", "Lead"]}
            />
          </Field>
          <Field label="Years of Experience">
            <TextInput defaultValue="4" type="number" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Skills">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Add a skill"
                  type="text"
                />
                <button
                  className="min-h-11 rounded-md bg-surface-muted px-5 font-semibold text-sm text-text-dark transition-colors hover:bg-border"
                  type="button"
                >
                  Add
                </button>
              </div>
            </Field>
            <TagList items={skills} />
          </div>
          <div className="md:col-span-2">
            <Field label="Industries Worked In (Optional)">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="E.g. FinTech, Healthcare"
                  type="text"
                />
                <button
                  className="min-h-11 rounded-md bg-surface-muted px-5 font-semibold text-sm text-text-dark transition-colors hover:bg-border"
                  type="button"
                >
                  Add
                </button>
              </div>
            </Field>
            <TagList items={industries} />
          </div>
        </div>
      </div>

      <div className="mt-10 border-border border-t pt-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-base text-text-primary">
            Work Experience
          </h3>
          <button
            className="font-semibold text-accent text-sm transition-colors hover:text-accent-dark"
            type="button"
          >
            + Add role
          </button>
        </div>
        <div className="mt-6 grid gap-5">
          {workRoles.map((role, index) => (
            <WorkRoleCard
              index={index}
              key={`${role.company}-${role.title}-${index}`}
              role={role}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 border-border border-t pt-8">
        <h3 className="font-semibold text-base text-text-primary">Education</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Highest Degree">
            <SelectInput
              defaultValue="High School"
              options={[
                "High School",
                "Associate",
                "Bachelor's",
                "Master's",
                "Doctorate",
              ]}
            />
          </Field>
          <Field label="Field of Study">
            <TextInput defaultValue="Computer Science" />
          </Field>
          <Field label="Institution Name">
            <TextInput placeholder="E.g. State University" />
          </Field>
          <Field label="Graduation Year">
            <TextInput placeholder="YYYY" />
          </Field>
        </div>
      </div>

      <div className="mt-10 border-border border-t pt-8">
        <h3 className="font-semibold text-base text-text-primary">
          Job Preferences
        </h3>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Job Titles Seeking">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  defaultValue="Frontend Engineer, React Developer"
                  type="text"
                />
                <button
                  className="min-h-11 rounded-md bg-surface-muted px-5 font-semibold text-sm text-text-dark transition-colors hover:bg-border"
                  type="button"
                >
                  Add
                </button>
              </div>
            </Field>
          </div>
          <Field label="Remote Preference">
            <SelectInput
              defaultValue="Any"
              options={["Any", "Remote", "Hybrid", "On-site"]}
            />
          </Field>
          <Field label="Salary Expectation (Optional)">
            <TextInput placeholder="E.g. $120k+" />
          </Field>
          <Field
            className="md:col-span-2"
            label="Preferred Locations (Optional)"
          >
            <TextInput placeholder="E.g. New York, London" />
          </Field>
          <Field className="md:col-span-2" label="Cover Letter Tone">
            <SelectInput
              defaultValue="Professional"
              options={["Professional", "Warm", "Confident", "Concise"]}
            />
          </Field>
        </div>
      </div>

      <div className="mt-10 border-border border-t pt-8">
        <button
          className="flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 font-semibold text-accent-foreground text-sm transition-colors hover:bg-accent-dark"
          type="button"
        >
          Save Profile
        </button>
      </div>
    </SectionCard>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-background">
      <UserIdentifier userId={user.id} email={user.email} />
      <AppNavbar activeHref="/profile" showSignOut={false} />
      <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-5 py-9 sm:px-8">
        <ProfileAttentionBanner />
        <ConnectedAccounts />
        <ResumeSection />
        <ProfileInformation email={user.email} />
      </div>
    </main>
  );
}
