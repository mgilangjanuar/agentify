-- AlterTable
ALTER TABLE "histories" ADD COLUMN     "installed_agent_id" TEXT;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_installed_agent_id_fkey" FOREIGN KEY ("installed_agent_id") REFERENCES "installed_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
