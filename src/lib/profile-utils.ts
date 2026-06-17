import { z } from "zod";

import type { MissingField, ProfileInput } from "@/types/profile";

const textSchema = z.string().trim();
const nullableTextSchema = z.string().trim().nullable();

const textListSchema = z
  .array(z.string())
  .transform((items) => normalizeList(items));

const workExperienceSchema = z.object({
  company: textSchema,
  title: textSchema,
  startDate: textSchema,
  endDate: textSchema,
  current: z.boolean(),
  responsibilities: textSchema,
});

const educationSchema = z.object({
  degree: nullableTextSchema,
  fieldOfStudy: textSchema,
  institution: textSchema,
  graduationYear: textSchema,
});

export const profileInputSchema = z.object({
  fullName: textSchema,
  email: textSchema,
  phone: textSchema,
  location: textSchema,
  linkedinUrl: textSchema,
  portfolioUrl: textSchema,
  workAuthorization: nullableTextSchema,
  currentTitle: textSchema,
  experienceLevel: nullableTextSchema,
  yearsExperience: z.number().int().min(0).nullable(),
  skills: textListSchema,
  industries: textListSchema,
  workExperience: z.array(workExperienceSchema).transform((roles) =>
    roles
      .map((role) => ({
        ...role,
        endDate: role.current ? "" : role.endDate,
      }))
      .filter(
        (role) =>
          role.company ||
          role.title ||
          role.responsibilities ||
          role.startDate ||
          role.endDate,
      )
      .slice(0, 3),
  ),
  education: z
    .array(educationSchema)
    .transform((items) =>
      items
        .filter(
          (item) =>
            item.degree ||
            item.fieldOfStudy ||
            item.institution ||
            item.graduationYear,
        )
        .slice(0, 3),
    ),
  jobTitlesSeeking: textListSchema,
  remotePreference: nullableTextSchema,
  preferredLocations: textListSchema,
  salaryExpectation: textSchema,
  coverLetterTone: nullableTextSchema,
}) as z.ZodType<ProfileInput>;

const REQUIRED_FIELDS: Array<{
  field: MissingField;
  isPresent: (profile: ProfileInput) => boolean;
}> = [
  { field: "FULL_NAME", isPresent: (profile) => hasText(profile.fullName) },
  { field: "EMAIL", isPresent: (profile) => hasText(profile.email) },
  { field: "PHONE", isPresent: (profile) => hasText(profile.phone) },
  { field: "LOCATION", isPresent: (profile) => hasText(profile.location) },
  {
    field: "CURRENT_TITLE",
    isPresent: (profile) => hasText(profile.currentTitle),
  },
  {
    field: "EXPERIENCE_LEVEL",
    isPresent: (profile) => hasText(profile.experienceLevel),
  },
  {
    field: "YEARS_EXPERIENCE",
    isPresent: (profile) => profile.yearsExperience !== null,
  },
  { field: "SKILLS", isPresent: (profile) => profile.skills.length > 0 },
  {
    field: "JOB_TITLES_SEEKING",
    isPresent: (profile) => profile.jobTitlesSeeking.length > 0,
  },
];

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

export function calculateCompletion(profile: ProfileInput) {
  const missingFields = REQUIRED_FIELDS.filter(
    ({ isPresent }) => !isPresent(profile),
  ).map(({ field }) => field);
  const completedCount = REQUIRED_FIELDS.length - missingFields.length;
  const percentage = Math.round(
    (completedCount / REQUIRED_FIELDS.length) * 100,
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    percentage,
  };
}

export function normalizeList(items: string[]) {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}
