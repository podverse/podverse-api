-- Adding the table creations here in case someone doesn't have them.
-- NOTE: The indexes inevitably get renamed due to CREATE TABLE LIKE process.

CREATE TABLE IF NOT EXISTS "episodeAlternateEnclosure" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bitrate" integer DEFAULT NULL,
  "codecs" varchar DEFAULT NULL,
  "default" boolean DEFAULT FALSE,
  "height" integer DEFAULT NULL,
  "isPublic" boolean DEFAULT FALSE,
  "lang" varchar DEFAULT NULL,
  "length" integer NOT NULL,
  "rel" varchar DEFAULT NULL,
  "title" varchar DEFAULT NULL,
  "type" varchar NOT NULL,
  "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

-- WORK IN PROGRESS
