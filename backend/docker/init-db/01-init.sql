-- Enable UUID generation using random bytes.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable UUID generation using uuid_generate_v4().
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text support (useful for email uniqueness).
CREATE EXTENSION IF NOT EXISTS "citext";
