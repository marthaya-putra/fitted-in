-- Add status_token_hash. Existing rows get a sentinel that matches no real token
-- (real tokens are 64-char sha256 hex; this is intentionally different) so the
-- NOT NULL constraint is satisfiable on a populated table. Default then dropped
-- so future inserts must supply the hash explicitly.
ALTER TABLE "pdf_generation" ADD COLUMN "status_token_hash" text NOT NULL DEFAULT '__legacy_no_token__';
ALTER TABLE "pdf_generation" ALTER COLUMN "status_token_hash" DROP DEFAULT;
