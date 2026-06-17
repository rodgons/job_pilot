import { NextResponse } from "next/server";

import { createInsforgeServer, getCurrentUser } from "@/lib/insforge-server";
import type { Profile } from "@/types/profile";

const RESUME_BUCKET = "resumes";

type ResumeDisposition = "inline" | "attachment";

export async function createResumeResponse(
  disposition: ResumeDisposition,
): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("resume_pdf_key")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[resume]", profileError);
      return NextResponse.json(
        { success: false, error: "Could not load resume details." },
        { status: 500 },
      );
    }

    const resumeKey = (profile as Pick<Profile, "resume_pdf_key"> | null)
      ?.resume_pdf_key;

    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: "No resume has been uploaded." },
        { status: 404 },
      );
    }

    if (!resumeKey.startsWith(`${user.id}/`)) {
      console.error("[resume] Resume key does not match user scope.");
      return NextResponse.json(
        { success: false, error: "Resume is unavailable." },
        { status: 403 },
      );
    }

    const { data: resume, error: downloadError } = await insforge.storage
      .from(RESUME_BUCKET)
      .download(resumeKey);

    if (downloadError || !resume) {
      console.error("[resume]", downloadError);
      return NextResponse.json(
        { success: false, error: "Could not download resume." },
        { status: 500 },
      );
    }

    return new Response(resume, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${disposition}; filename="resume.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("[resume]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
