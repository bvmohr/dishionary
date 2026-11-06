-- ============================================================================
-- Dishionary Phase 2: Initial PostgreSQL Schema, Auth Triggers & RLS Policies
-- ============================================================================

-- 1. Profiles Table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Home Chef',
  avatar_url TEXT,
  bio TEXT,
  theme_preference TEXT NOT NULL DEFAULT 'system',
  default_view_mode TEXT NOT NULL DEFAULT 'grid',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure ON DELETE CASCADE is present even if table was created via db:push first
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  DROP CONSTRAINT IF EXISTS profiles_id_users_id_fk,
  ADD CONSTRAINT profiles_id_users_id_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  image_storage_path TEXT,
  prep_time_minutes INTEGER NOT NULL DEFAULT 0,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 2,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'Main Course',
  tags TEXT[] NOT NULL DEFAULT '{}',
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions_markdown TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  imported_from_recipe_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(user_id, category);

-- 3. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'book-open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- 4. Recipe <-> Collections Join Table
CREATE TABLE IF NOT EXISTS public.recipe_collections (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, collection_id)
);

-- 5. Shared Recipe Links Table
CREATE TABLE IF NOT EXISTS public.shared_recipe_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  import_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_recipe_links_token ON public.shared_recipe_links(share_token);

-- ============================================================================
-- Automatic Profile Provisioning Trigger on Supabase Auth Signup (Email / OIDC)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1),
      'Home Chef'
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- Row-Level Security (RLS) Policies — Strict Per-User Cookbook Isolation
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_recipe_links ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Recipes Policies
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
CREATE POLICY "Users can view their own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own recipes" ON public.recipes;
CREATE POLICY "Users can create their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Collections Policies
DROP POLICY IF EXISTS "Users can manage their own collections" ON public.collections;
CREATE POLICY "Users can manage their own collections"
  ON public.collections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recipe Collections Join Policies
DROP POLICY IF EXISTS "Users can manage their own recipe collections" ON public.recipe_collections;
CREATE POLICY "Users can manage their own recipe collections"
  ON public.recipe_collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_collections.recipe_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_collections.recipe_id AND r.user_id = auth.uid()
    )
  );

-- Shared Recipe Links Policies
DROP POLICY IF EXISTS "Users can manage their own shared recipe links" ON public.shared_recipe_links;
CREATE POLICY "Users can manage their own shared recipe links"
  ON public.shared_recipe_links FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

