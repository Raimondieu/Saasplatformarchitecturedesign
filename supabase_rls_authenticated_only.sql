-- =========================================================
-- RLS: Solo utenti autenticati, accesso limitato ai propri progetti
-- =========================================================
-- Eseguire nell'editor SQL di Supabase.
-- Effetto: chi non è loggato non vede/modifica nulla; chi è loggato
-- vede solo i dati dei progetti a cui è assegnato (o tutto se Admin).
-- =========================================================

-- Helper: ritorna true se l'utente corrente è Admin globale
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (global_role = 'Admin' OR role = 'Admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: ritorna i project_id a cui l'utente è assegnato (per policy, no ricorsione)
CREATE OR REPLACE FUNCTION public.get_my_project_ids()
RETURNS SETOF uuid AS $$
  SELECT project_id FROM public.project_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =========================================================
-- PROFILES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- Solo se autenticato: lettura del proprio profilo
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Solo se autenticato: aggiornamento del proprio profilo
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Admin può leggere tutti i profili (per pannello admin)
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

-- Admin può aggiornare tutti i profili (ruoli)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

-- =========================================================
-- ORGANIZATIONS
-- =========================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can read organizations" ON public.organizations;

-- Lettura: solo autenticati; solo le org che hanno almeno un progetto a cui sei assegnato (o Admin vede tutto)
CREATE POLICY "orgs_select"
  ON public.organizations FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR id IN (SELECT organization_id FROM public.projects WHERE id IN (SELECT public.get_my_project_ids()))
    )
  );

-- Scrittura: solo Admin
CREATE POLICY "orgs_insert"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "orgs_update"
  ON public.organizations FOR UPDATE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "orgs_delete"
  ON public.organizations FOR DELETE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

-- =========================================================
-- PROJECTS
-- =========================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Members can read their projects" ON public.projects;

-- Lettura: solo autenticati; solo i progetti a cui sei assegnato o Admin
CREATE POLICY "projects_select"
  ON public.projects FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (public.is_global_admin() OR id IN (SELECT public.get_my_project_ids()))
  );

-- Scrittura: solo Admin
CREATE POLICY "projects_insert"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "projects_update"
  ON public.projects FOR UPDATE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "projects_delete"
  ON public.projects FOR DELETE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

-- =========================================================
-- PROJECT_MEMBERS
-- =========================================================
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access on project_members" ON public.project_members;
DROP POLICY IF EXISTS "Users can read own memberships" ON public.project_members;

-- Lettura: solo autenticati; solo le proprie assegnazioni o Admin
CREATE POLICY "project_members_select"
  ON public.project_members FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (public.is_global_admin() OR user_id = auth.uid())
  );

-- Scrittura: solo Admin
CREATE POLICY "project_members_insert"
  ON public.project_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "project_members_update"
  ON public.project_members FOR UPDATE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

CREATE POLICY "project_members_delete"
  ON public.project_members FOR DELETE
  USING (auth.uid() IS NOT NULL AND public.is_global_admin());

-- =========================================================
-- MATERIALITY_ASSESSMENT
-- =========================================================
ALTER TABLE public.materiality_assessment ENABLE ROW LEVEL SECURITY;

-- Rimuovi policy esistenti se presenti
DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'materiality_assessment' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.materiality_assessment', pol.policyname); END LOOP;
END $$;

-- Accesso solo se autenticato e (progetto tra i propri O Admin). Righe senza project_id: solo Admin.
CREATE POLICY "materiality_select"
  ON public.materiality_assessment FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
      OR (project_id IS NULL AND public.is_global_admin())
    )
  );

CREATE POLICY "materiality_insert"
  ON public.materiality_assessment FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

CREATE POLICY "materiality_update"
  ON public.materiality_assessment FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

CREATE POLICY "materiality_delete"
  ON public.materiality_assessment FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

-- =========================================================
-- ESRS_DATA_POINTS
-- =========================================================
ALTER TABLE public.esrs_data_points ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'esrs_data_points' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.esrs_data_points', pol.policyname); END LOOP;
END $$;

CREATE POLICY "datapoints_select"
  ON public.esrs_data_points FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
      OR (project_id IS NULL AND public.is_global_admin())
    )
  );

CREATE POLICY "datapoints_insert"
  ON public.esrs_data_points FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

CREATE POLICY "datapoints_update"
  ON public.esrs_data_points FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

CREATE POLICY "datapoints_delete"
  ON public.esrs_data_points FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_global_admin()
      OR (project_id IS NOT NULL AND project_id IN (SELECT public.get_my_project_ids()))
    )
  );

-- =========================================================
-- ESRS_CATALOG (solo lettura per tutti gli autenticati)
-- =========================================================
ALTER TABLE public.esrs_catalog ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'esrs_catalog' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.esrs_catalog', pol.policyname); END LOOP;
END $$;

-- Solo utenti autenticati possono leggere il catalogo (dati di riferimento)
CREATE POLICY "catalog_select"
  ON public.esrs_catalog FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Nessuna scrittura dal client (opzionale: solo Admin; qui nessuno per semplicità)
-- Se in futuro serve modificare il catalogo, aggiungere policy INSERT/UPDATE/DELETE per is_global_admin().
