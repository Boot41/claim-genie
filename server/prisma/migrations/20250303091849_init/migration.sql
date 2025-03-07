-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_policy_id_fkey";

-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT "Claim_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_claim_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalHistory" DROP CONSTRAINT "MedicalHistory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
