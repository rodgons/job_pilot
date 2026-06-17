-- JobPilot Database Schema
-- All tables use Row Level Security (RLS) to ensure users can only access their own data

-- Drop existing tables if they exist (for safe re-runs)
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS agent_runs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  work_authorization TEXT,
  
  -- Professional Information
  current_title TEXT,
  experience_level TEXT,
  years_experience INTEGER,
  skills TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  
  -- Work Experience & Education
  work_experience JSONB,
  education JSONB,
  
  -- Job Preferences
  job_titles_seeking TEXT[] DEFAULT '{}',
  remote_preference TEXT,
  preferred_locations TEXT[] DEFAULT '{}',
  salary_expectation TEXT,
  cover_letter_tone TEXT,
  
  -- Resume & Status
  resume_pdf_url TEXT,
  resume_pdf_key TEXT,
  completion_percentage INTEGER DEFAULT 0,
  missing_fields TEXT[] DEFAULT '{}',
  is_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can create their own profile
CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Users can delete their own profile
CREATE POLICY profiles_delete ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- AGENT_RUNS TABLE
-- ============================================================================
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'running',
  job_title_searched TEXT,
  location_searched TEXT,
  jobs_found INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on agent_runs
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own runs
CREATE POLICY agent_runs_select ON agent_runs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own runs
CREATE POLICY agent_runs_update ON agent_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own runs
CREATE POLICY agent_runs_delete ON agent_runs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Job Source & URLs
  source TEXT,
  source_url TEXT,
  external_apply_url TEXT,
  
  -- Job Information
  title TEXT,
  company TEXT,
  location TEXT,
  salary TEXT,
  job_type TEXT,
  about_role TEXT,
  about_company TEXT,
  
  -- Job Details (arrays)
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  nice_to_have TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  
  -- Matching Information
  match_score INTEGER,
  match_reason TEXT,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  
  -- Company Research
  company_research JSONB,
  
  -- Timestamps
  found_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own jobs
CREATE POLICY jobs_select ON jobs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own jobs
CREATE POLICY jobs_update ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own jobs
CREATE POLICY jobs_delete ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AGENT_LOGS TABLE
-- ============================================================================
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  message TEXT,
  level TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on agent_logs
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own logs
CREATE POLICY agent_logs_select ON agent_logs FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own logs
CREATE POLICY agent_logs_update ON agent_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own logs
CREATE POLICY agent_logs_delete ON agent_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Index for common queries
CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_run_id ON jobs(run_id);
CREATE INDEX idx_agent_logs_user_id ON agent_logs(user_id);
CREATE INDEX idx_agent_logs_run_id ON agent_logs(run_id);
