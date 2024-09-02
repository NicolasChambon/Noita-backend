BEGIN;

CREATE TABLE IF NOT EXISTS "admin" (
  "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "username" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "carousel_picture" (
  "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "url" text NOT NULL UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "concert" (
  "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "city" text NOT NULL,
  "event_date" date NOT NULL,
  "venue" text,
  "event_name" text,
  "event_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "post" (
  "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "title_fr" text NOT NULL,
  "title_de" text NOT NULL,
  "content_fr" text NOT NULL,
  "content_de" text NOT NULL,
  "image_url" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz
);

COMMIT;