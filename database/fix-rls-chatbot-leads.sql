-- Fix RLS (Row Level Security) for chatbot_leads table
-- Kjør dette i Supabase SQL Editor hvis leads ikke lagres

-- Sjekk om RLS er aktivert
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chatbot_leads';

-- Hvis RLS er aktivert, deaktiver det (eller opprett policy)
-- Alternativ 1: Deaktiver RLS (enklest for service key)
ALTER TABLE public.chatbot_leads DISABLE ROW LEVEL SECURITY;

-- Alternativ 2: Behold RLS men opprett policy som tillater inserts med service key
-- (Service key bypasser RLS, men hvis du vil ha RLS aktivert, bruk denne)
-- ALTER TABLE public.chatbot_leads ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow service key inserts" ON public.chatbot_leads
-- FOR INSERT
-- WITH CHECK (true);

-- Verifiser at tabellen kan leses
SELECT COUNT(*) FROM public.chatbot_leads;

-- Test insert (skal fungere med service key)
-- INSERT INTO public.chatbot_leads (navn, epost, samtale)
-- VALUES ('Test', 'test@example.com', 'Test samtale')
-- RETURNING *;

