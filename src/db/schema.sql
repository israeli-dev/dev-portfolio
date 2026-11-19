-- Folio schema (PostgreSQL).
-- Locally this runs against PGlite (Postgres compiled to WASM) using the
-- DATABASE_URL directory; in production the identical DDL runs on Postgres.
-- Every statement is idempotent so the app can bootstrap a fresh database.

CREATE TABLE IF NOT EXISTS users (
  id            text PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'USER',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         text PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip         text
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         text PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reset_tokens_user_idx ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS portfolios (
  id           text PRIMARY KEY,
  user_id      text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  headline     text NOT NULL DEFAULT '',
  bio          text NOT NULL DEFAULT '',
  location     text NOT NULL DEFAULT '',
  email        text NOT NULL DEFAULT '',
  phone        text NOT NULL DEFAULT '',
  avatar_url   text,
  cover_url    text,
  availability text NOT NULL DEFAULT '',
  template     text NOT NULL DEFAULT 'signal',
  accent       text NOT NULL DEFAULT '#7DD3C0',
  font_style   text NOT NULL DEFAULT 'sans',
  appearance   text NOT NULL DEFAULT 'dark',
  published    boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  sections     text NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portfolios_user_idx ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS portfolios_published_idx ON portfolios(published);

CREATE TABLE IF NOT EXISTS owner_profile (
  id         text PRIMARY KEY DEFAULT 'owner',
  full_name  text NOT NULL,
  title      text NOT NULL,
  tagline    text NOT NULL,
  story      text NOT NULL,
  location   text NOT NULL,
  email      text NOT NULL,
  github_url text NOT NULL,
  linkedin   text NOT NULL DEFAULT '',
  twitter    text NOT NULL DEFAULT '',
  resume_url text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_entries (
  id         text PRIMARY KEY,
  year       text NOT NULL,
  title      text NOT NULL,
  detail     text NOT NULL,
  kind       text NOT NULL DEFAULT 'milestone',
  verified   boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS social_links (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  label        text NOT NULL,
  url          text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS social_links_portfolio_idx ON social_links(portfolio_id);

CREATE TABLE IF NOT EXISTS skill_groups (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name         text NOT NULL,
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS skill_groups_portfolio_idx ON skill_groups(portfolio_id);

CREATE TABLE IF NOT EXISTS skills (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  group_id     text REFERENCES skill_groups(id) ON DELETE SET NULL,
  name         text NOT NULL,
  learning     boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS skills_portfolio_idx ON skills(portfolio_id);
CREATE INDEX IF NOT EXISTS skills_group_idx ON skills(group_id);

CREATE TABLE IF NOT EXISTS experiences (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  role         text NOT NULL,
  organization text NOT NULL,
  start_date   text NOT NULL,
  end_date     text,
  current      boolean NOT NULL DEFAULT false,
  location     text,
  summary      text NOT NULL DEFAULT '',
  highlights   text NOT NULL DEFAULT '[]',
  tech         text NOT NULL DEFAULT '[]',
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS experiences_portfolio_idx ON experiences(portfolio_id);

CREATE TABLE IF NOT EXISTS educations (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  degree       text NOT NULL,
  institution  text NOT NULL,
  year         text,
  location     text,
  detail       text NOT NULL DEFAULT '',
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS educations_portfolio_idx ON educations(portfolio_id);

CREATE TABLE IF NOT EXISTS certifications (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title        text NOT NULL,
  issuer       text NOT NULL,
  year         text,
  url          text,
  learning     boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS certifications_portfolio_idx ON certifications(portfolio_id);

CREATE TABLE IF NOT EXISTS achievements (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title        text NOT NULL,
  detail       text NOT NULL DEFAULT '',
  year         text,
  kind         text NOT NULL DEFAULT 'award',
  sort_order   integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS achievements_portfolio_idx ON achievements(portfolio_id);

CREATE TABLE IF NOT EXISTS projects (
  id             text PRIMARY KEY,
  portfolio_id   text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  slug           text NOT NULL,
  name           text NOT NULL,
  tagline        text NOT NULL DEFAULT '',
  description    text NOT NULL DEFAULT '',
  category       text NOT NULL DEFAULT 'ai-llm',
  status         text NOT NULL DEFAULT 'in-development',
  progress       integer,
  repo_url       text,
  repo_name      text,
  demo_url       text,
  image_url      text,
  stack          text NOT NULL DEFAULT '[]',
  features       text NOT NULL DEFAULT '[]',
  problem        text NOT NULL DEFAULT '',
  contribution   text NOT NULL DEFAULT '',
  architecture   text NOT NULL DEFAULT '',
  featured       boolean NOT NULL DEFAULT false,
  published      boolean NOT NULL DEFAULT true,
  excluded       boolean NOT NULL DEFAULT false,
  source         text NOT NULL DEFAULT 'manual',
  github_repo_id text,
  language       text,
  stars          integer NOT NULL DEFAULT 0,
  forks          integer NOT NULL DEFAULT 0,
  last_pushed_at timestamptz,
  readme_note    text,
  sort_order     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (portfolio_id, slug),
  UNIQUE (portfolio_id, github_repo_id)
);
CREATE INDEX IF NOT EXISTS projects_portfolio_idx ON projects(portfolio_id);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON projects(featured);

CREATE TABLE IF NOT EXISTS project_images (
  id         text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt        text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS project_images_project_idx ON project_images(project_id);

CREATE TABLE IF NOT EXISTS github_integrations (
  id             text PRIMARY KEY,
  portfolio_id   text NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
  username       text NOT NULL,
  last_synced_at timestamptz,
  etag           text,
  rate_remaining integer,
  rate_reset     timestamptz,
  last_error     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id           text PRIMARY KEY,
  user_id      text REFERENCES users(id) ON DELETE SET NULL,
  portfolio_id text REFERENCES portfolios(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL,
  subject      text NOT NULL DEFAULT '',
  message      text NOT NULL,
  read         boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_user_idx ON contact_messages(user_id, created_at);

CREATE TABLE IF NOT EXISTS activity_logs (
  id           text PRIMARY KEY,
  portfolio_id text NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  action       text NOT NULL,
  detail       text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_logs_portfolio_idx ON activity_logs(portfolio_id, created_at);
