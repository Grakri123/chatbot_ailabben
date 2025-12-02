-- Opprett chatbot_leads tabell for AI Labben
-- Kjør dette i Supabase SQL Editor

-- Opprett tabellen
CREATE TABLE IF NOT EXISTS public.chatbot_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  navn TEXT NULL,
  bedrift TEXT NULL,
  epost TEXT NULL,
  samtale TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chatbot_leads_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Deaktiver RLS (Row Level Security) for å tillate inserts med service key
-- Service key skal uansett bypass RLS, men dette sikrer at det fungerer
ALTER TABLE public.chatbot_leads DISABLE ROW LEVEL SECURITY;

-- Opprett indekser for raskere søk
CREATE INDEX IF NOT EXISTS idx_chatbot_leads_epost ON public.chatbot_leads(epost);
CREATE INDEX IF NOT EXISTS idx_chatbot_leads_created_at ON public.chatbot_leads(created_at);

-- Kommentar på tabellen
COMMENT ON TABLE public.chatbot_leads IS 'Lagrer leads og samtaler fra AI Labben chatbot';

-- Test at tabellen ble opprettet
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chatbot_leads' 
ORDER BY ordinal_position;

-- Test insert (valgfritt - kan kommenteres ut etter testing)
-- INSERT INTO public.chatbot_leads (navn, epost, samtale)
-- VALUES ('Test Bruker', 'test@example.com', 'Dette er en test samtale')
-- RETURNING *;

