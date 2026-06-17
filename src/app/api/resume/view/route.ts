import { createResumeResponse } from "@/lib/resume-response";

export async function GET(): Promise<Response> {
  return createResumeResponse("inline");
}
