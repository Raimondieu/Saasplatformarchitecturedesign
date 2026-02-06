-- =========================================================
-- FIX DEFINITIVO: Elimina tutte le policy ricorsive su profiles
-- e usa funzioni SECURITY DEFINER per bypassare RLS
-- =========================================================

-- 1. ELIMINA TUTTE le policy su profiles
DO $$ DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- 2. Policy SEMPLICI che non causano ricorsione
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Funzione RPC per leggere il proprio profilo (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json AS $$
  SELECT row_to_json(p) FROM public.profiles p WHERE p.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Funzione RPC per Admin: leggere tutti i profili
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS SETOF json AS $$
  SELECT row_to_json(p) FROM public.profiles p ORDER BY p.email;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Funzione RPC per Admin: aggiornare ruolo di qualsiasi utente
CREATE OR REPLACE FUNCTION public.admin_update_profile_role(target_user_id UUID, new_global_role TEXT)
RETURNS void AS $$
BEGIN
  -- Verifica che chi chiama sia Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (global_role = 'Admin' OR role = 'Admin')
  ) THEN
    RAISE EXCEPTION 'Solo gli Admin possono modificare i ruoli';
  END IF;
  UPDATE public.profiles SET global_role = new_global_role WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
