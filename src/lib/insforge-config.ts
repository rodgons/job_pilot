export function getInsforgeConfig(): { baseUrl: string; anonKey: string } {
  const baseUrl =
    process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_PROJECT_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Missing InsForge URL or anonymous key configuration.");
  }

  return { baseUrl, anonKey };
}
