BEGIN;

CREATE TABLE IF NOT EXISTS "admin" (
  "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "username" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz,
)



COMMIT;