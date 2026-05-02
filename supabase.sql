-- ============================================
-- TABLE A: Residents (handled by Supabase Auth)
-- We extend the auth.users table with a profile
-- ============================================
CREATE TABLE public.residents (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  apartment_number TEXT NOT NULL,
  building_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE B: Parties Communes (Common Areas)
-- ============================================
CREATE TABLE public.parties_communes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ascenseur', 'couloir', 'parking', 'jardin', 'toit', 'local_poubelle', 'local_velo', 'escalier', 'autre')),
  description TEXT,
  etage TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE C: Signalements (Reports) — joins Table A and Table B
-- ============================================
CREATE TABLE public.signalements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  espace_id UUID REFERENCES public.parties_communes(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  priorite TEXT NOT NULL DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'resolu', 'rejete')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA for Table B (Common Areas)
-- ============================================
INSERT INTO public.parties_communes (nom, type, description, etage) VALUES
  ('Ascenseur Principal', 'ascenseur', 'Ascenseur central desservant tous les étages', 'Tous'),
  ('Couloir Rez-de-chaussée', 'couloir', 'Couloir principal du rez-de-chaussée', 'RDC'),
  ('Parking Sous-sol', 'parking', 'Parking souterrain réservé aux résidents', 'Sous-sol'),
  ('Jardin Commun', 'jardin', 'Espace vert partagé entre les résidents', 'Extérieur'),
  ('Local Poubelles', 'local_poubelle', 'Local de tri sélectif et ramassage', 'RDC'),
  ('Escalier A', 'escalier', 'Escalier de secours côté nord', 'Tous'),
  ('Toit Terrasse', 'toit', 'Terrasse commune au sommet du bâtiment', 'R+6'),
  ('Local Vélos', 'local_velo', 'Local sécurisé pour le stationnement des vélos', 'Sous-sol');

-- ============================================
-- ROW LEVEL SECURITY (CRITICAL)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties_communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;

-- RESIDENTS: Users can only read and update their own profile
CREATE POLICY "residents_select_own" ON public.residents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "residents_insert_own" ON public.residents
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "residents_update_own" ON public.residents
  FOR UPDATE USING (auth.uid() = id);

-- PARTIES COMMUNES: All authenticated users can view all common areas
CREATE POLICY "parties_communes_select_all" ON public.parties_communes
  FOR SELECT USING (auth.role() = 'authenticated');

-- SIGNALEMENTS: Users can ONLY see, create, and update THEIR OWN reports
CREATE POLICY "signalements_select_own" ON public.signalements
  FOR SELECT USING (auth.uid() = resident_id);

CREATE POLICY "signalements_insert_own" ON public.signalements
  FOR INSERT WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "signalements_update_own" ON public.signalements
  FOR UPDATE USING (auth.uid() = resident_id);

-- ============================================
-- STORAGE RLS (Run after creating 'signalement-photos' bucket)
-- ============================================
-- Allow authenticated users to upload to their own folder
CREATE POLICY "upload_own_photo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'signalement-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view photos
CREATE POLICY "view_own_photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'signalement-photos' AND
    auth.role() = 'authenticated'
  );
