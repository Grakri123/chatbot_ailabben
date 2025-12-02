-- AI Chatbot Assistant Database Schema
-- Supabase PostgreSQL Setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";

-- Customers table - hver kunde med sin konfigurasjon
CREATE TABLE customers (
    customer_id TEXT PRIMARY KEY, -- Auth system ID som unik identifikator
    name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt TEXT,
    api_provider VARCHAR(20) DEFAULT 'mistral' CHECK (api_provider IN ('openai', 'mistral')),
    model_name VARCHAR(50) DEFAULT 'mistral-large-latest',
    max_tokens INTEGER DEFAULT 1000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat logger (session-based - one row per conversation)
CREATE TABLE chat_logs (
    customer_id TEXT REFERENCES customers(customer_id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL, -- generes i frontend
    user_message TEXT NOT NULL, -- accumulated user messages separated by \n---\n
    bot_response TEXT NOT NULL, -- accumulated bot responses separated by \n---\n
    message_count INTEGER DEFAULT 1, -- number of messages in this session
    user_name VARCHAR(255), -- collected on 3rd message
    user_email VARCHAR(255), -- collected on 3rd message  
    contact_collected BOOLEAN DEFAULT FALSE, -- true when name/email are collected
    current_url VARCHAR(500),
    user_ip VARCHAR(45),
    user_agent TEXT,
    total_response_time_ms INTEGER DEFAULT 0, -- sum of all response times
    total_tokens_used INTEGER DEFAULT 0, -- sum of all tokens used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (customer_id, session_id)
);

-- Vector chunks for større kunnskapsbase (valgfritt)
CREATE TABLE vector_chunks (
    customer_id TEXT REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    source_url VARCHAR(500),
    source_title VARCHAR(255),
    chunk_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (customer_id, chunk_index)
);

-- Indexes for performance
CREATE INDEX idx_chat_logs_customer_id ON chat_logs(customer_id);
CREATE INDEX idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX idx_vector_chunks_customer_id ON vector_chunks(customer_id);

-- Vector similarity search index (hvis du bruker embeddings)
CREATE INDEX idx_vector_chunks_embedding ON vector_chunks USING ivfflat (embedding vector_cosine_ops);

-- Sample data - customer_id must be added manually
-- INSERT INTO customers (customer_id, name, system_prompt, user_prompt, api_provider, model_name) VALUES (
--     '',  -- Add customer_id manually
--     'Your Company Name',
--     'Your system prompt here',
--     'Bruker spør: {user_message}\n\nURL: {current_url}',
--     'mistral',
--     'mistral-large-latest'
-- );





-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_logs_updated_at BEFORE UPDATE ON chat_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
