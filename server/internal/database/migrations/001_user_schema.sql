CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    refresh_token_expiration TIMESTAMP WITH TIME ZONE
);
