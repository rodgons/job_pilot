"use server";

import { revalidatePath } from "next/cache";

import { createInsforgeServer, requireUser } from "@/lib/insforge-server";
import { captureServerEvent } from "@/lib/posthog-server";
import { calculateCompletion, profileInputSchema } from "@/lib/profile-utils";
import type { ActionResult, Profile, ProfileInput } from "@/types/profile";

const RESUME_BUCKET = "resumes";
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

type StoredProfile = Pick<
  Profile,
  "id" | "is_complete" | "resume_pdf_key"
> | null;

function toProfileRecord(
  userId: string,
  email: string | undefined,
  input: ProfileInput,
) {
  const completion = calculateCompletion(input);

  return {
    id: userId,
    full_name: input.fullName || null,
    email: email ?? (input.email || null),
    phone: input.phone || null,
    location: input.location || null,
    linkedin_url: input.linkedinUrl || null,
    portfolio_url: input.portfolioUrl || null,
    work_authorization: input.workAuthorization || null,
    current_title: input.currentTitle || null,
    experience_level: input.experienceLevel || null,
    years_experience: input.yearsExperience,
    skills: input.skills,
    industries: input.industries,
    work_experience: input.workExperience,
    education: input.education,
    job_titles_seeking: input.jobTitlesSeeking,
    remote_preference: input.remotePreference || null,
    preferred_locations: input.preferredLocations,
    salary_expectation: input.salaryExpectation || null,
    cover_letter_tone: input.coverLetterTone || null,
    completion_percentage: completion.percentage,
    missing_fields: completion.missingFields,
    is_complete: completion.isComplete,
  };
}

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await requireUser();

  try {
    const insforge = await createInsforgeServer();
    const parsedProfile = profileInputSchema.safeParse({
      ...input,
      email: user.email ?? input.email,
    });

    if (!parsedProfile.success) {
      return {
        error:
          parsedProfile.error.issues[0]?.message ??
          "Profile data is invalid. Please review the form.",
      };
    }

    const normalizedInput = parsedProfile.data;
    const record = toProfileRecord(user.id, user.email, normalizedInput);

    if (!record.is_complete) {
      return { error: "Complete all required fields before saving." };
    }

    const { data: existingProfile, error: readError } = await insforge.database
      .from("profiles")
      .select("id, is_complete, resume_pdf_key")
      .eq("id", user.id)
      .maybeSingle();

    if (readError) {
      return { error: readError.message };
    }

    if ((existingProfile as StoredProfile)?.id) {
      const { data, error } = await insforge.database
        .from("profiles")
        .update(record)
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return { error: "Profile could not be updated. Please try again." };
      }
    } else {
      const { error } = await insforge.database
        .from("profiles")
        .insert([record])
        .select("id")
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }
    }

    const previousProfile = existingProfile as StoredProfile;

    if (
      previousProfile?.id &&
      !previousProfile.is_complete &&
      record.is_complete
    ) {
      await captureServerEvent({
        distinctId: user.id,
        event: "profile_completed",
        properties: {
          completion_percentage: record.completion_percentage,
        },
      });
    }

    revalidatePath("/profile");
    return { success: "Profile saved." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Profile could not be saved. Please try again.",
    };
  }
}

export async function uploadResume(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();

  try {
    const file = formData.get("resume");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Choose a PDF resume to upload." };
    }

    if (file.type !== "application/pdf") {
      return { error: "Resume must be a PDF file." };
    }

    if (file.size > MAX_RESUME_SIZE) {
      return { error: "Resume must be 5MB or smaller." };
    }

    const insforge = await createInsforgeServer();
    const resumeKey = `${user.id}/resume.pdf`;

    const { data: existingProfile } = await insforge.database
      .from("profiles")
      .select("id, resume_pdf_key")
      .eq("id", user.id)
      .maybeSingle();
    const previousKey = (existingProfile as StoredProfile)?.resume_pdf_key;

    if (previousKey) {
      const { error: removeError } = await insforge.storage
        .from(RESUME_BUCKET)
        .remove(previousKey);

      if (removeError) {
        return {
          error: "Existing resume could not be replaced. Please try again.",
        };
      }
    }

    const { data: upload, error: uploadError } = await insforge.storage
      .from(RESUME_BUCKET)
      .upload(resumeKey, file);

    if (uploadError || !upload) {
      return {
        error: uploadError?.message ?? "Resume could not be uploaded.",
      };
    }

    const resumeRecord = {
      id: user.id,
      email: user.email ?? null,
      resume_pdf_url: upload.url,
      resume_pdf_key: upload.key ?? resumeKey,
    };

    if ((existingProfile as StoredProfile)?.id) {
      const { data, error } = await insforge.database
        .from("profiles")
        .update({
          resume_pdf_url: upload.url,
          resume_pdf_key: upload.key ?? resumeKey,
        })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return {
          error: "Resume was uploaded, but the profile was not updated.",
        };
      }
    } else {
      const { error } = await insforge.database
        .from("profiles")
        .insert([resumeRecord])
        .select("id")
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }
    }

    revalidatePath("/profile");
    return { success: "Resume uploaded." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Resume could not be uploaded. Please try again.",
    };
  }
}
