-- CreateEnum
CREATE TYPE "LEVELS" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" "LEVELS" NOT NULL,
    "nameUrl" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "role" "ROLES" NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "routeId" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_nameUrl_key" ON "courses"("nameUrl");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
