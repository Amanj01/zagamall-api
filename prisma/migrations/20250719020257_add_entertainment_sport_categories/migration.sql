-- AlterTable
ALTER TABLE "EntertainmentAndSport" ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "EntertainmentAndSportCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntertainmentAndSportCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EntertainmentAndSportCategory_name_key" ON "EntertainmentAndSportCategory"("name");

-- AddForeignKey
ALTER TABLE "EntertainmentAndSport" ADD CONSTRAINT "EntertainmentAndSport_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EntertainmentAndSportCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
