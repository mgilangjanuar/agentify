-- DropForeignKey
ALTER TABLE "histories" DROP CONSTRAINT "histories_installed_agent_id_fkey";

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_installed_agent_id_fkey" FOREIGN KEY ("installed_agent_id") REFERENCES "installed_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
