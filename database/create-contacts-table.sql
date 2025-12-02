-- AI Labben Contact Logging Table
-- Kjør dette i Supabase SQL Editor

-- Tabell for å lagre kontaktinfo og samtaler
CREATE TABLE ailabben_contacts (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    conversation_history JSONB NOT NULL, -- Hele samtalen som JSON
    trigger_message TEXT, -- Meldingen som trigget kontaktskjemaet
    current_url VARCHAR(500),
    user_ip VARCHAR(45),
    user_agent TEXT,
    session_duration INTEGER, -- Varighet i millisekunder
    end_reason VARCHAR(50) DEFAULT 'contact_collected', -- timeout, manual, contact_collected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for raskere søk
CREATE INDEX idx_ailabben_contacts_session_id ON ailabben_contacts(session_id);
CREATE INDEX idx_ailabben_contacts_email ON ailabben_contacts(customer_email);
CREATE INDEX idx_ailabben_contacts_created_at ON ailabben_contacts(created_at);

-- Kommentar på tabellen
COMMENT ON TABLE ailabben_contacts IS 'Lagrer kontaktinfo og samtaler fra AI Labben chatbot';

-- Test at tabellen ble opprettet
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ailabben_contacts' 
ORDER BY ordinal_position;
