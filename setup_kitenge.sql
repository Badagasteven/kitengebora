
-- Run this inside psql as a superuser or a user with CREATE DATABASE rights

CREATE DATABASE kitenge;

\c kitenge

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price INTEGER NOT NULL,
    image TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    is_promo BOOLEAN DEFAULT FALSE,
    original_price INTEGER,
    discount INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

INSERT INTO products (name, description, category, price, image, in_stock, is_promo, original_price, discount)
VALUES
('Kitenge Sunrise', 'Bright orange and yellow pattern.', 'Modern', 15000,
 'https://placehold.co/400x300/f97316/ffffff?text=Sunrise', true, true, 20000, 25),
('Royal Ankara', 'Deep blue and gold for special occasions.', 'Traditional', 25000,
 'https://placehold.co/400x300/1d4ed8/ffffff?text=Ankara', true, false, NULL, NULL);
