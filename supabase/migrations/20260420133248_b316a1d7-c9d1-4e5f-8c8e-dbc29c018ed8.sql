-- Hired agents per user
CREATE TABLE public.hired_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  custom_name TEXT,
  tone INTEGER NOT NULL DEFAULT 50,
  detail INTEGER NOT NULL DEFAULT 50,
  initiative INTEGER NOT NULL DEFAULT 50,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  desk_color TEXT NOT NULL DEFAULT 'oak',
  desk_plant TEXT NOT NULL DEFAULT 'monstera',
  desk_poster TEXT NOT NULL DEFAULT 'none',
  desk_lighting TEXT NOT NULL DEFAULT 'warm',
  grid_x INTEGER NOT NULL DEFAULT 0,
  grid_y INTEGER NOT NULL DEFAULT 0,
  hired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

ALTER TABLE public.hired_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own hired agents"
  ON public.hired_agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users hire own agents"
  ON public.hired_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own hired agents"
  ON public.hired_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users fire own agents"
  ON public.hired_agents FOR DELETE
  USING (auth.uid() = user_id);

-- Throttle/silence map for pop-ins
CREATE TABLE public.agent_silenced_until (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT 'global',
  silenced_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id, context)
);

ALTER TABLE public.agent_silenced_until ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own silence records"
  ON public.agent_silenced_until FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own silence records"
  ON public.agent_silenced_until FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own silence records"
  ON public.agent_silenced_until FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own silence records"
  ON public.agent_silenced_until FOR DELETE
  USING (auth.uid() = user_id);

-- Touch updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER hired_agents_touch_updated
BEFORE UPDATE ON public.hired_agents
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_hired_agents_user ON public.hired_agents(user_id);
CREATE INDEX idx_silenced_user_ctx ON public.agent_silenced_until(user_id, context);