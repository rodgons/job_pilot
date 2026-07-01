"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { revalidatePath } from "next/cache";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { z } from "zod";

import { createInsforgeServer, requireUser } from "@/lib/insforge-server";
import { captureServerEvent } from "@/lib/posthog-server";
import { calculateCompletion, profileInputSchema } from "@/lib/profile-utils";
import type {
  ActionResult,
  ExtractProfileResult,
  Profile,
  ProfileInput,
} from "@/types/profile";

const RESUME_BUCKET = "resumes";
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MIN_EXTRACTED_TEXT_LENGTH = 100;
const MAX_RESUME_TEXT_LENGTH = 12_000;

const extractedTextSchema = z.preprocess(
  (value) => (value === null || value === undefined ? "" : value),
  z.string().trim(),
);

const extractedNullableTextSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.string().trim().nullable(),
);

const extractedStringListSchema = z.preprocess(
  (value) => (Array.isArray(value) ? value : []),
  z
    .array(extractedTextSchema)
    .transform((items) => items.filter((item) => item.length > 0)),
);

const extractedYearsSchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.coerce.number().int().min(0).nullable(),
);

type StoredProfile = Pick<
  Profile,
  "id" | "is_complete" | "resume_pdf_key"
> | null;

const extractedProfileSchema = z.object({
  fullName: extractedTextSchema.optional().default(""),
  phone: extractedTextSchema.optional().default(""),
  location: extractedTextSchema.optional().default(""),
  linkedinUrl: extractedTextSchema.optional().default(""),
  portfolioUrl: extractedTextSchema.optional().default(""),
  workAuthorization: extractedNullableTextSchema.optional().default(null),
  currentTitle: extractedTextSchema.optional().default(""),
  experienceLevel: extractedNullableTextSchema.optional().default(null),
  yearsExperience: extractedYearsSchema.optional().default(null),
  skills: extractedStringListSchema.optional().default([]),
  industries: extractedStringListSchema.optional().default([]),
  workExperience: z
    .array(
      z.object({
        company: extractedTextSchema.optional().default(""),
        title: extractedTextSchema.optional().default(""),
        startDate: extractedTextSchema.optional().default(""),
        endDate: extractedTextSchema.optional().default(""),
        current: z.boolean().optional().default(false),
        responsibilities: extractedTextSchema.optional().default(""),
      }),
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        degree: extractedNullableTextSchema.optional().default(null),
        fieldOfStudy: extractedTextSchema.optional().default(""),
        institution: extractedTextSchema.optional().default(""),
        graduationYear: extractedTextSchema.optional().default(""),
      }),
    )
    .optional()
    .default([]),
  jobTitlesSeeking: extractedStringListSchema.optional().default([]),
  remotePreference: extractedNullableTextSchema.optional().default(null),
  preferredLocations: extractedStringListSchema.optional().default([]),
  salaryExpectation: extractedTextSchema.optional().default(""),
  coverLetterTone: extractedNullableTextSchema.optional().default(null),
});

async function resumeToBuffer(resume: unknown) {
  if (resume instanceof Blob) {
    return Buffer.from(await resume.arrayBuffer());
  }

  if (resume instanceof ArrayBuffer) {
    return Buffer.from(resume);
  }

  if (Buffer.isBuffer(resume)) {
    return resume;
  }

  throw new Error("Downloaded resume is not readable.");
}

function extractJson(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match?.[1]?.trim() ?? trimmed;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

function parseExtractedProfile(text: string) {
  try {
    const json = JSON.parse(extractJson(text));
    return extractedProfileSchema.parse(json);
  } catch (error) {
    console.error("[profile/extract] Gemini response could not be parsed", {
      error,
      responseLength: text.length,
      responsePreview: text.slice(0, 1000),
    });
    return null;
  }
}

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

export async function extractProfile(): Promise<ExtractProfileResult> {
  const user = await requireUser();

  try {
    const insforge = await createInsforgeServer();
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("resume_pdf_key")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return { error: profileError.message };
    }

    const resumeKey = (profile as StoredProfile)?.resume_pdf_key;

    if (!resumeKey) {
      return { error: "Upload a resume before extracting profile details." };
    }

    if (!resumeKey.startsWith(`${user.id}/`)) {
      return { error: "Resume is unavailable." };
    }

    const { data: resume, error: downloadError } = await insforge.storage
      .from(RESUME_BUCKET)
      .download(resumeKey);

    if (downloadError || !resume) {
      return {
        error: downloadError?.message ?? "Could not download resume.",
      };
    }

    const buffer = await resumeToBuffer(resume);
    const parsedPdf = await pdf(buffer).catch((error) => {
      console.error("[profile/extract] PDF parse failed", error);
      return null;
    });

    if (!parsedPdf) {
      return {
        error:
          "Could not extract text from this PDF. Please try a different file.",
      };
    }

    const resumeText = parsedPdf.text.trim();

    if (resumeText.length < MIN_EXTRACTED_TEXT_LENGTH) {
      console.error("[profile/extract] Extracted resume text was too short", {
        textLength: resumeText.length,
      });
      return {
        error:
          "Could not extract text from this PDF. Please try a different file.",
      };
    }

    const ai = getGeminiClient();
    const response = await ai.models
      .generateContent({
        model: "gemini-2.5-flash",
        contents: `Extract structured candidate profile data from this resume text. Return only JSON matching the schema. Do not invent facts. Use empty strings for unknown string fields, empty arrays for unknown list fields, and null only for nullable fields. Keep work experience responsibilities concise. Convert work and education dates to YYYY-MM where possible. Limit workExperience and education to the 3 most recent entries. Choose experienceLevel from Junior, Mid-level, Senior, or Lead when possible.\n\nRESUME TEXT:\n${resumeText.slice(0, MAX_RESUME_TEXT_LENGTH)}`,
        config: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              linkedinUrl: { type: Type.STRING },
              portfolioUrl: { type: Type.STRING },
              workAuthorization: { type: Type.STRING, nullable: true },
              currentTitle: { type: Type.STRING },
              experienceLevel: { type: Type.STRING, nullable: true },
              yearsExperience: { type: Type.NUMBER, nullable: true },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              industries: { type: Type.ARRAY, items: { type: Type.STRING } },
              workExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    title: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    current: { type: Type.BOOLEAN },
                    responsibilities: { type: Type.STRING },
                  },
                  required: [
                    "company",
                    "title",
                    "startDate",
                    "endDate",
                    "current",
                    "responsibilities",
                  ],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING, nullable: true },
                    fieldOfStudy: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    graduationYear: { type: Type.STRING },
                  },
                  required: [
                    "degree",
                    "fieldOfStudy",
                    "institution",
                    "graduationYear",
                  ],
                },
              },
              jobTitlesSeeking: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              remotePreference: { type: Type.STRING, nullable: true },
              preferredLocations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              salaryExpectation: { type: Type.STRING },
              coverLetterTone: { type: Type.STRING, nullable: true },
            },
            required: [
              "fullName",
              "phone",
              "location",
              "linkedinUrl",
              "portfolioUrl",
              "workAuthorization",
              "currentTitle",
              "experienceLevel",
              "yearsExperience",
              "skills",
              "industries",
              "workExperience",
              "education",
              "jobTitlesSeeking",
              "remotePreference",
              "preferredLocations",
              "salaryExpectation",
              "coverLetterTone",
            ],
          },
        },
      })
      .catch((error) => {
        console.error("[profile/extract] Gemini request failed", error);
        throw error;
      });

    const extracted = parseExtractedProfile(response.text ?? "");

    if (!extracted) {
      return {
        error:
          "Could not extract structured profile details. Please try again or fill the form manually.",
      };
    }

    return {
      success: "Profile details extracted. Review and save your profile.",
      profile: {
        ...extracted,
        workExperience: extracted.workExperience.slice(0, 3),
        education: extracted.education.slice(0, 3),
      },
    };
  } catch (error) {
    console.error("[profile/extract]", error);
    return {
      error: "Profile details could not be extracted. Please try again.",
    };
  }
}
