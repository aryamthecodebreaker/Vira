-- Vira Real Estate Assistant - Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  auth_type TEXT NOT NULL DEFAULT 'guest' CHECK (auth_type IN ('google', 'guest')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- User preferences (learned from conversations)
CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_min BIGINT,
  budget_max BIGINT,
  locations TEXT[] DEFAULT '{}',
  property_types TEXT[] DEFAULT '{}',
  bhk_preferences TEXT[] DEFAULT '{}',
  purpose TEXT,
  timeline TEXT,
  amenities TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- Properties
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  type TEXT NOT NULL,
  configurations TEXT[] DEFAULT '{}',
  price_min BIGINT NOT NULL,
  price_max BIGINT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  website TEXT,
  developer TEXT,
  rera_number TEXT,
  amenities TEXT[] DEFAULT '{}',
  usps TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  source TEXT NOT NULL CHECK (source IN ('partner', 'owner', 'scraped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price_min, price_max);

-- Property views tracking
CREATE TABLE property_views (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_views_user ON property_views(user_id);
CREATE INDEX idx_property_views_property ON property_views(property_id);

-- Partner submissions
CREATE TABLE partner_submissions (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  agency TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Owner submissions
CREATE TABLE owner_submissions (
  id TEXT PRIMARY KEY,
  owner_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  legal_status TEXT,
  negotiable BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_submissions ENABLE ROW LEVEL SECURITY;

-- Policies: allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true);
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true);
CREATE POLICY "Service role full access" ON user_preferences FOR ALL USING (true);
CREATE POLICY "Service role full access" ON properties FOR ALL USING (true);
CREATE POLICY "Service role full access" ON property_views FOR ALL USING (true);
CREATE POLICY "Service role full access" ON partner_submissions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON owner_submissions FOR ALL USING (true);

-- Public read access to approved properties
CREATE POLICY "Public read approved properties" ON properties
  FOR SELECT USING (status = 'approved');
