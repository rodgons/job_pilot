"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { saveProfile, uploadResume } from "@/actions/profile";
import { calculateCompletion, normalizeList } from "@/lib/profile-utils";
import type {
  ActionResult,
  Education,
  MissingField,
  Profile,
  ProfileInput,
  WorkExperience,
} from "@/types/profile";

const inputClass =
  "min-h-11 w-full rounded-md border border-border bg-surface-secondary px-4 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:bg-surface disabled:cursor-not-allowed disabled:text-text-muted";

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase leading-4 text-text-secondary";

const fieldLabels: Record<MissingField, string> = {
  FULL_NAME: "FULL NAME",
  EMAIL: "EMAIL",
  PHONE: "PHONE",
  LOCATION: "LOCATION",
  CURRENT_TITLE: "CURRENT TITLE",
  EXPERIENCE_LEVEL: "EXPERIENCE LEVEL",
  YEARS_EXPERIENCE: "YEARS EXPERIENCE",
  SKILLS: "SKILLS",
  JOB_TITLES_SEEKING: "JOB TITLES",
};

function emptyRole(): WorkExperience {
  return {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
  };
}

function emptyEducation(): Education {
  return {
    degree: null,
    fieldOfStudy: "",
    institution: "",
    graduationYear: "",
  };
}

function nullableSelectValue(value: string) {
  return value === "" ? null : value;
}

type StoredWorkExperience = WorkExperience & {
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
};

function monthToNumber(month: string | undefined) {
  const monthIndex = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].indexOf(month ?? "");

  return monthIndex >= 0 ? String(monthIndex + 1).padStart(2, "0") : "";
}

function legacyMonth(month?: string, year?: string) {
  const monthNumber = monthToNumber(month);

  if (!year || !monthNumber || year === "Present") {
    return "";
  }

  return `${year}-${monthNumber}`;
}

function normalizeMonthValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : null;
}

function normalizeStoredRole(role: StoredWorkExperience): WorkExperience {
  return {
    company: role.company ?? "",
    title: role.title ?? "",
    startDate:
      normalizeMonthValue(role.startDate) ??
      legacyMonth(role.startMonth, role.startYear),
    endDate: role.current
      ? ""
      : (normalizeMonthValue(role.endDate) ??
        legacyMonth(role.endMonth, role.endYear)),
    current: Boolean(role.current),
    responsibilities: role.responsibilities ?? "",
  };
}

function normalizeStoredEducation(
  education: Education | Education[] | null,
): Education[] {
  if (Array.isArray(education)) {
    return education.length > 0 ? education.slice(0, 3) : [emptyEducation()];
  }

  return education ? [education] : [emptyEducation()];
}

function defaultInput(
  profile: Profile | null,
  userEmail?: string,
): ProfileInput {
  const workExperience =
    profile?.work_experience && profile.work_experience.length > 0
      ? profile.work_experience.map((role) =>
          normalizeStoredRole(role as StoredWorkExperience),
        )
      : [emptyRole()];

  return {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? userEmail ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    linkedinUrl: profile?.linkedin_url ?? "",
    portfolioUrl: profile?.portfolio_url ?? "",
    workAuthorization: profile?.work_authorization ?? null,
    currentTitle: profile?.current_title ?? "",
    experienceLevel: profile?.experience_level ?? null,
    yearsExperience: profile?.years_experience ?? null,
    skills: profile?.skills ?? [],
    industries: profile?.industries ?? [],
    workExperience: workExperience.slice(0, 3),
    education: normalizeStoredEducation(profile?.education ?? null),
    jobTitlesSeeking: profile?.job_titles_seeking ?? [],
    remotePreference: profile?.remote_preference ?? null,
    preferredLocations: profile?.preferred_locations ?? [],
    salaryExpectation: profile?.salary_expectation ?? "",
    coverLetterTone: profile?.cover_letter_tone ?? null,
  };
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
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
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`block ${className}`}>
      <span className={labelClass}>
        {label}
        {required ? <span className="ml-1 text-error">*</span> : null}
      </span>
      {children}
    </div>
  );
}

function ProfileAttentionBanner({
  missingFields,
  percentage,
}: {
  missingFields: MissingField[];
  percentage: number;
}) {
  if (percentage >= 100) {
    return null;
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (percentage / 100);

  return (
    <SectionCard className="border-[color-mix(in_srgb,var(--color-error)_24%,var(--color-border))] px-6 py-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[560px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center text-error">
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
            </span>
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
                {fieldLabels[field]}
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
            {percentage}%
          </span>
        </div>
      </div>
    </SectionCard>
  );
}

function ResumeSection({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [resumeStatus, setResumeStatus] = useState<ActionResult>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploading, startUploadTransition] = useTransition();
  const hasResume = Boolean(profile?.resume_pdf_key);
  const resumeFileName =
    profile?.resume_pdf_key?.split("/").pop() ?? "resume.pdf";
  const resumeViewUrl = "/api/resume/view";
  const resumeDownloadUrl = "/api/resume/download";

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewOpen]);

  function handleUpload(file: File | undefined) {
    setResumeStatus({});

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setResumeStatus({ error: "Resume must be a PDF file." });
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    startUploadTransition(async () => {
      const result = await uploadResume(formData);
      setResumeStatus(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

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
          {hasResume ? "Resume uploaded" : "Click to upload or drag and drop"}
        </p>
        {hasResume ? (
          <p className="mt-1 font-medium text-accent text-sm">
            {resumeFileName}
          </p>
        ) : null}
        <p className="mt-2 font-medium text-sm text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <label className="mt-6 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-5 font-semibold text-sm text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:bg-surface-secondary">
          {isUploading
            ? "Uploading..."
            : hasResume
              ? "Replace Resume"
              : "Select Resume"}
          <input
            accept="application/pdf"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => handleUpload(event.target.files?.[0])}
            type="file"
          />
        </label>
        {resumeStatus.error ? (
          <p className="mt-4 font-medium text-error text-sm">
            {resumeStatus.error}
          </p>
        ) : null}
        {resumeStatus.success ? (
          <p className="mt-4 font-medium text-sm text-success-dark">
            {resumeStatus.success}
          </p>
        ) : null}
      </div>

      {hasResume ? (
        <div className="mt-6 border-border border-t pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-sm text-text-primary">
                Uploaded resume
              </p>
              <p className="mt-1 font-medium text-text-secondary text-xs">
                Preview the current PDF before generating or replacing it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 font-semibold text-sm text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:bg-surface-secondary"
                onClick={() => setIsPreviewOpen((current) => !current)}
                type="button"
              >
                {isPreviewOpen ? "Hide Preview" : "Preview Resume"}
              </button>
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 font-semibold text-sm text-text-primary shadow-[0_1px_2px_color-mix(in_srgb,var(--color-overlay)_8%,transparent)] transition-colors hover:bg-surface-secondary"
                href={resumeViewUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open PDF
              </a>
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 font-semibold text-accent-foreground text-sm transition-opacity hover:opacity-90"
                download
                href={resumeDownloadUrl}
              >
                Download
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {isPreviewOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          role="dialog"
        >
          <button
            aria-label="Close resume preview"
            className="absolute inset-0 bg-overlay/60"
            onClick={() => setIsPreviewOpen(false)}
            type="button"
          />
          <div className="relative flex h-[min(760px,calc(100vh-48px))] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_80px_color-mix(in_srgb,var(--color-overlay)_24%,transparent)]">
            <div className="flex min-h-14 items-center justify-between border-border border-b px-5">
              <div>
                <p className="font-semibold text-sm text-text-primary">
                  Resume Preview
                </p>
                <p className="font-medium text-text-muted text-xs">
                  Uploaded resume
                </p>
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface px-4 font-semibold text-sm text-text-primary transition-colors hover:bg-surface-secondary"
                onClick={() => setIsPreviewOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <iframe
              className="min-h-0 flex-1 bg-surface"
              src={resumeViewUrl}
              title="Resume PDF preview"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 border-border border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 font-semibold text-accent-foreground text-sm opacity-60"
          disabled
          type="button"
        >
          Generate Resume from Profile
        </button>
      </div>
    </SectionCard>
  );
}

function TagEditor({
  items,
  label,
  onChange,
  placeholder,
  required = false,
}: {
  items: string[];
  label: string;
  onChange: (items: string[]) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const next = normalizeList([...items, draft]);
    onChange(next);
    setDraft("");
  }

  return (
    <div className="md:col-span-2">
      <Field label={label} required={required}>
        <div className="flex gap-2">
          <input
            aria-required={required}
            className={inputClass}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItem();
              }
            }}
            placeholder={placeholder}
            type="text"
            value={draft}
          />
          <button
            className="min-h-11 rounded-md bg-surface-muted px-5 font-semibold text-sm text-text-dark transition-colors hover:bg-border"
            onClick={addItem}
            type="button"
          >
            Add
          </button>
        </div>
      </Field>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            className="inline-flex min-h-8 items-center gap-1 rounded-md bg-surface-muted px-3 font-semibold text-sm text-text-dark"
            key={item}
            onClick={() => onChange(items.filter((value) => value !== item))}
            type="button"
          >
            {item}
            <span className="text-text-muted">x</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthPicker({
  disabled = false,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      className={`${inputClass} [color-scheme:light]`}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      type="month"
      value={value}
    />
  );
}

function WorkRoleCard({
  index,
  onChange,
  onRemove,
  role,
}: {
  index: number;
  onChange: (role: WorkExperience) => void;
  onRemove: () => void;
  role: WorkExperience;
}) {
  function patchRole(update: Partial<WorkExperience>) {
    onChange({ ...role, ...update });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-semibold text-sm text-text-primary">
          Role {index + 1}
        </p>
        {index > 0 ? (
          <button
            className="font-semibold text-error text-xs transition-colors hover:text-text-primary"
            onClick={onRemove}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company Name">
          <input
            className={inputClass}
            onChange={(event) => patchRole({ company: event.target.value })}
            placeholder="Company name"
            type="text"
            value={role.company}
          />
        </Field>
        <Field label="Job Title">
          <input
            className={inputClass}
            onChange={(event) => patchRole({ title: event.target.value })}
            placeholder="Job title"
            type="text"
            value={role.title}
          />
        </Field>
        <Field label="Start Month">
          <MonthPicker
            onChange={(startDate) => patchRole({ startDate })}
            value={role.startDate}
          />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className={labelClass}>End Month</span>
            <label className="flex items-center gap-2 font-semibold text-text-secondary text-xs">
              <input
                checked={role.current}
                className="h-4 w-4 accent-[var(--color-info-dark)]"
                onChange={(event) =>
                  patchRole({ current: event.target.checked })
                }
                type="checkbox"
              />
              Currently working here
            </label>
          </div>
          <MonthPicker
            disabled={role.current}
            onChange={(endDate) => patchRole({ endDate })}
            value={role.current ? "" : role.endDate}
          />
        </div>
        <Field className="md:col-span-2" label="Key Responsibilities">
          <textarea
            className={`${inputClass} min-h-28 resize-y py-3 leading-6`}
            onChange={(event) =>
              patchRole({ responsibilities: event.target.value })
            }
            placeholder="Summarize your scope, impact, and tools used."
            value={role.responsibilities}
          />
        </Field>
      </div>
    </div>
  );
}

function EducationCard({
  education,
  index,
  onChange,
  onRemove,
}: {
  education: Education;
  index: number;
  onChange: (education: Education) => void;
  onRemove: () => void;
}) {
  function patchEducation(update: Partial<Education>) {
    onChange({ ...education, ...update });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-secondary p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-semibold text-sm text-text-primary">
          Education {index + 1}
        </p>
        {index > 0 ? (
          <button
            className="font-semibold text-error text-xs transition-colors hover:text-text-primary"
            onClick={onRemove}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Highest Degree">
          <select
            className={inputClass}
            onChange={(event) =>
              patchEducation({
                degree: nullableSelectValue(event.target.value),
              })
            }
            value={education.degree ?? ""}
          >
            <option value="">select...</option>
            {[
              "High School",
              "Associate",
              "Bachelor's",
              "Master's",
              "Doctorate",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Field of Study">
          <input
            className={inputClass}
            onChange={(event) =>
              patchEducation({ fieldOfStudy: event.target.value })
            }
            type="text"
            value={education.fieldOfStudy}
          />
        </Field>
        <Field label="Institution Name">
          <input
            className={inputClass}
            onChange={(event) =>
              patchEducation({ institution: event.target.value })
            }
            placeholder="E.g. State University"
            type="text"
            value={education.institution}
          />
        </Field>
        <Field label="Graduation Year">
          <input
            className={inputClass}
            onChange={(event) =>
              patchEducation({ graduationYear: event.target.value })
            }
            placeholder="YYYY"
            type="text"
            value={education.graduationYear}
          />
        </Field>
      </div>
    </div>
  );
}

function ConnectedAccounts() {
  return (
    <SectionCard>
      <h2 className="font-semibold text-lg text-text-primary">
        Connected Accounts
      </h2>
      <p className="mt-1 font-medium text-sm text-text-secondary">
        Connect your LinkedIn so the agent handles manual apply-with-LinkedIn
        workflows.
      </p>
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-sm text-text-primary">LinkedIn</p>
          <p className="mt-1 font-medium text-text-muted text-xs">
            Not connected
          </p>
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

function ProfileForm({
  initialInput,
  profile,
}: {
  initialInput: ProfileInput;
  profile: Profile | null;
}) {
  const [form, setForm] = useState(initialInput);
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<ActionResult>({});
  const [isSaving, startSaveTransition] = useTransition();
  const completion = calculateCompletion(form);

  function patchForm(update: Partial<ProfileInput>) {
    setForm((current) => ({ ...current, ...update }));
  }

  function patchEducation(index: number, education: Education) {
    setForm((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? education : item,
      ),
    }));
  }

  function patchRole(index: number, role: WorkExperience) {
    setForm((current) => ({
      ...current,
      workExperience: current.workExperience.map((item, itemIndex) =>
        itemIndex === index ? role : item,
      ),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveStatus({});

    if (!completion.isComplete) {
      setSaveStatus({
        error: `Complete required fields before saving: ${completion.missingFields
          .map((field) => fieldLabels[field])
          .join(", ")}.`,
      });
      return;
    }

    startSaveTransition(async () => {
      const result = await saveProfile(form);
      setSaveStatus(result);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <>
      <ProfileAttentionBanner
        missingFields={completion.missingFields}
        percentage={completion.percentage}
      />
      <ConnectedAccounts />
      <ResumeSection profile={profile} />
      <SectionCard>
        <form onSubmit={handleSubmit}>
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
              <Field label="Full Name" required>
                <input
                  aria-required="true"
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ fullName: event.target.value })
                  }
                  type="text"
                  value={form.fullName}
                />
              </Field>
              <Field label="Email" required>
                <input
                  aria-required="true"
                  className={inputClass}
                  readOnly
                  type="email"
                  value={form.email}
                />
              </Field>
              <Field label="Phone Number" required>
                <input
                  aria-required="true"
                  className={inputClass}
                  onChange={(event) => patchForm({ phone: event.target.value })}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={form.phone}
                />
              </Field>
              <Field label="Location" required>
                <input
                  aria-required="true"
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ location: event.target.value })
                  }
                  placeholder="City, Country"
                  type="text"
                  value={form.location}
                />
              </Field>
              <Field label="LinkedIn URL">
                <input
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ linkedinUrl: event.target.value })
                  }
                  type="url"
                  value={form.linkedinUrl}
                />
              </Field>
              <Field label="Portfolio / Github">
                <input
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ portfolioUrl: event.target.value })
                  }
                  type="url"
                  value={form.portfolioUrl}
                />
              </Field>
              <Field label="Work Authorization">
                <select
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({
                      workAuthorization: nullableSelectValue(
                        event.target.value,
                      ),
                    })
                  }
                  value={form.workAuthorization ?? ""}
                >
                  <option value="">select...</option>
                  {["Citizen", "Permanent resident", "Work visa"].map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-10 border-border border-t pt-8">
            <h3 className="font-semibold text-base text-text-primary">
              Professional Info
            </h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                className="md:col-span-2"
                label="Current/Recent Job Title"
                required
              >
                <input
                  aria-required="true"
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ currentTitle: event.target.value })
                  }
                  type="text"
                  value={form.currentTitle}
                />
              </Field>
              <Field label="Experience Level" required>
                <select
                  aria-required="true"
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({
                      experienceLevel: nullableSelectValue(event.target.value),
                    })
                  }
                  value={form.experienceLevel ?? ""}
                >
                  <option value="">select...</option>
                  {["Junior", "Mid-level", "Senior", "Lead"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <Field label="Years of Experience" required>
                <input
                  aria-required="true"
                  className={inputClass}
                  min="0"
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    patchForm({
                      yearsExperience: Number.isNaN(value) ? null : value,
                    });
                  }}
                  type="number"
                  value={form.yearsExperience ?? ""}
                />
              </Field>
              <TagEditor
                items={form.skills}
                label="Skills"
                onChange={(skills) => patchForm({ skills })}
                placeholder="Add a skill"
                required
              />
              <TagEditor
                items={form.industries}
                label="Industries Worked In (Optional)"
                onChange={(industries) => patchForm({ industries })}
                placeholder="E.g. FinTech, Healthcare"
              />
            </div>
          </div>

          <div className="mt-10 border-border border-t pt-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-text-primary">
                Work Experience
              </h3>
              <button
                className="font-semibold text-accent text-sm transition-colors hover:text-accent-dark disabled:text-text-muted"
                disabled={form.workExperience.length >= 3}
                onClick={() =>
                  patchForm({
                    workExperience: [...form.workExperience, emptyRole()],
                  })
                }
                type="button"
              >
                + Add role
              </button>
            </div>
            <div className="mt-6 grid gap-5">
              {form.workExperience.map((role, index) => (
                <WorkRoleCard
                  index={index}
                  key={`${index}-${role.company}-${role.title}`}
                  onChange={(nextRole) => patchRole(index, nextRole)}
                  onRemove={() =>
                    patchForm({
                      workExperience: form.workExperience.filter(
                        (_role, roleIndex) => roleIndex !== index,
                      ),
                    })
                  }
                  role={role}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 border-border border-t pt-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-base text-text-primary">
                Education
              </h3>
              <button
                className="font-semibold text-accent text-sm transition-colors hover:text-accent-dark disabled:text-text-muted"
                disabled={form.education.length >= 3}
                onClick={() =>
                  patchForm({
                    education: [...form.education, emptyEducation()],
                  })
                }
                type="button"
              >
                + Add education
              </button>
            </div>
            <div className="mt-6 grid gap-5">
              {form.education.map((education, index) => (
                <EducationCard
                  education={education}
                  index={index}
                  key={`${index}-${education.institution}-${education.degree}`}
                  onChange={(nextEducation) =>
                    patchEducation(index, nextEducation)
                  }
                  onRemove={() =>
                    patchForm({
                      education: form.education.filter(
                        (_education, educationIndex) =>
                          educationIndex !== index,
                      ),
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-10 border-border border-t pt-8">
            <h3 className="font-semibold text-base text-text-primary">
              Job Preferences
            </h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TagEditor
                items={form.jobTitlesSeeking}
                label="Job Titles Seeking"
                onChange={(jobTitlesSeeking) => patchForm({ jobTitlesSeeking })}
                placeholder="E.g. Frontend Engineer"
                required
              />
              <Field label="Remote Preference">
                <select
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({
                      remotePreference: nullableSelectValue(event.target.value),
                    })
                  }
                  value={form.remotePreference ?? ""}
                >
                  <option value="">select...</option>
                  {["Any", "Remote", "Hybrid", "On-site"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <Field label="Salary Expectation (Optional)">
                <input
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({ salaryExpectation: event.target.value })
                  }
                  placeholder="E.g. $120k+"
                  type="text"
                  value={form.salaryExpectation}
                />
              </Field>
              <TagEditor
                items={form.preferredLocations}
                label="Preferred Locations (Optional)"
                onChange={(preferredLocations) =>
                  patchForm({ preferredLocations })
                }
                placeholder="E.g. New York, London"
              />
              <Field className="md:col-span-2" label="Cover Letter Tone">
                <select
                  className={inputClass}
                  onChange={(event) =>
                    patchForm({
                      coverLetterTone: nullableSelectValue(event.target.value),
                    })
                  }
                  value={form.coverLetterTone ?? ""}
                >
                  <option value="">select...</option>
                  {["Professional", "Warm", "Confident", "Concise"].map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-10 border-border border-t pt-8">
            <button
              className="flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 font-semibold text-accent-foreground text-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            {saveStatus.error ? (
              <p className="mt-4 text-center font-medium text-error text-sm">
                {saveStatus.error}
              </p>
            ) : null}
            {saveStatus.success ? (
              <p className="mt-4 text-center font-medium text-sm text-success-dark">
                {saveStatus.success}
              </p>
            ) : null}
          </div>
        </form>
      </SectionCard>
    </>
  );
}

export function ProfilePageClient({
  profile,
  userEmail,
}: {
  profile: Profile | null;
  userEmail?: string;
}) {
  const initialInput = defaultInput(profile, userEmail);

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-5 py-9 sm:px-8">
      <ProfileForm initialInput={initialInput} profile={profile} />
    </div>
  );
}
