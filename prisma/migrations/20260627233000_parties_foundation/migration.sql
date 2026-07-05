-- Rename Party table to parties
ALTER TABLE "Party" RENAME TO "parties";

-- Rename existing timestamp / status columns to snake_case
ALTER TABLE "parties" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "parties" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "parties" RENAME COLUMN "updatedAt" TO "updated_at";

-- Add new party columns
ALTER TABLE "parties"
  ADD COLUMN "code" VARCHAR(32),
  ADD COLUMN "name_en" VARCHAR(255),
  ADD COLUMN "mobile" VARCHAR(32),
  ADD COLUMN "city" VARCHAR(128),
  ADD COLUMN "tax_number" VARCHAR(128),
  ADD COLUMN "commercial_register" VARCHAR(128),
  ADD COLUMN "notes" TEXT;

-- Backfill codes for existing rows
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at", id) AS rn
  FROM "parties"
)
UPDATE "parties" p
SET "code" = 'PAR-' || LPAD(ordered.rn::text, 6, '0')
FROM ordered
WHERE p.id = ordered.id;

ALTER TABLE "parties" ALTER COLUMN "code" SET NOT NULL;

-- Indexes and uniqueness
CREATE UNIQUE INDEX "parties_code_key" ON "parties"("code");
CREATE UNIQUE INDEX "parties_type_searchName_key" ON "parties"("type", "searchName");
CREATE INDEX "parties_code_idx" ON "parties"("code");
CREATE INDEX "parties_is_active_idx" ON "parties"("is_active");

