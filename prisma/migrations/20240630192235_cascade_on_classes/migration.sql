-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_routeId_fkey";

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
