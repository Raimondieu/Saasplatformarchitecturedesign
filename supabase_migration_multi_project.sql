-- =========================================================
-- MIGRAZIONE: Supporto Multi-Organizzazione e Multi-Progetto
-- =========================================================
-- Eseguire questo script nell'editor SQL di Supabase.
-- Va eseguito PRIMA di usare la nuova versione dell'app.
-- =========================================================

-- =========================================================
-- STEP 0: AGGIUNGERE global_role A profiles (DEVE ESSERE PRIMA DI TUTTO)
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'global_role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN global_role TEXT DEFAULT 'DataCollector';
    -- Copia i valori esistenti dalla colonna role (se esiste)
    UPDATE public.profiles SET global_role = role WHERE role IS NOT NULL AND global_role IS NULL;
  END IF;
END $$;

-- =========================================================
-- STEP 1: TABELLA ORGANIZATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on organizations"
  ON public.organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.global_role = 'Admin' OR profiles.role = 'Admin')
    )
  );

-- =========================================================
-- STEP 2: TABELLA PROJECTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_year INT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, reporting_year)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on projects"
  ON public.projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.global_role = 'Admin' OR profiles.role = 'Admin')
    )
  );

-- (policy "Members can read their projects" spostata dopo STEP 3)

-- =========================================================
-- STEP 3: TABELLA PROJECT_MEMBERS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'DataCollector',
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on project_members"
  ON public.project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.global_role = 'Admin' OR profiles.role = 'Admin')
    )
  );

CREATE POLICY "Users can read own memberships"
  ON public.project_members FOR SELECT
  USING (user_id = auth.uid());

-- Policy per projects che dipende da project_members (ora che esiste)
CREATE POLICY "Members can read their projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

-- =========================================================
-- STEP 4: AGGIUNGERE project_id A materiality_assessment
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'materiality_assessment' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.materiality_assessment ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_materiality_project ON public.materiality_assessment(project_id);
  END IF;
END $$;

-- =========================================================
-- STEP 5: AGGIUNGERE project_id A esrs_data_points
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esrs_data_points' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.esrs_data_points ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_datapoints_project ON public.esrs_data_points(project_id);
  END IF;
END $$;

-- =========================================================
-- STEP 6: FUNZIONE SECURITY DEFINER PER EVITARE RICORSIONE RLS
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (global_role = 'Admin' OR role = 'Admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================================================
-- STEP 7: POLICY AGGIORNATE PER profiles (senza ricorsione)
-- =========================================================
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_global_admin());

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_global_admin());

-- =========================================================
-- STEP 7: INDICI
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);

-- =========================================================
-- STEP 8: AGGIORNARE IL TRIGGER DI CREAZIONE PROFILO
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, global_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'DataCollector'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
