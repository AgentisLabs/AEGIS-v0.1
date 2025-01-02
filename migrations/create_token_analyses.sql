CREATE TABLE IF NOT EXISTS token_analyses (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    name TEXT,
    symbol TEXT,
    overall_score FLOAT,
    summary TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    sources JSONB,
    market_metrics JSONB,
    risk_assessment JSONB,
    social_metrics JSONB,
    times_searched INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS token_analyses_address_idx ON token_analyses(address); 