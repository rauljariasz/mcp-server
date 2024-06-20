-- AlterTable
ALTER TABLE "users" ADD COLUMN     "code_expiry" TIMESTAMP(3),
ADD COLUMN     "verification_code" TEXT;
