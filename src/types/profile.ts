export type MissingField =
  | "FULL_NAME"
  | "EMAIL"
  | "PHONE"
  | "LOCATION"
  | "CURRENT_TITLE"
  | "EXPERIENCE_LEVEL"
  | "YEARS_EXPERIENCE"
  | "SKILLS"
  | "JOB_TITLES_SEEKING";

export type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

export type Education = {
  degree: string | null;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperience[] | null;
  education: Education[] | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  completion_percentage: number | null;
  missing_fields: MissingField[] | null;
  is_complete: boolean | null;
};

export type ProfileInput = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string | null;
  currentTitle: string;
  experienceLevel: string | null;
  yearsExperience: number | null;
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: Education[];
  jobTitlesSeeking: string[];
  remotePreference: string | null;
  preferredLocations: string[];
  salaryExpectation: string;
  coverLetterTone: string | null;
};

export type ActionResult = {
  error?: string;
  success?: string;
};
