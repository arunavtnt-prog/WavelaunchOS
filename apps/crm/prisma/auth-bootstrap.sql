BEGIN;

DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'CLIENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lockedUntil" TIMESTAMP(3),
  "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
  "lastLoginAt" TIMESTAMP(3),
  "lastLoginIp" TEXT,
  "sessionExpiry" TIMESTAMP(3),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "login_attempts" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "userAgent" TEXT,
  "success" BOOLEAN NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "login_attempts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "login_attempts_email_createdAt_idx"
  ON "login_attempts"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "login_attempts_ip_createdAt_idx"
  ON "login_attempts"("ip", "createdAt");
CREATE INDEX IF NOT EXISTS "login_attempts_userId_createdAt_idx"
  ON "login_attempts"("userId", "createdAt");

COMMIT;
