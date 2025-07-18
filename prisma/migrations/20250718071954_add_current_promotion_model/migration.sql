-- CreateTable
CREATE TABLE "CurrentPromotion" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "participatingStores" TEXT NOT NULL,

    CONSTRAINT "CurrentPromotion_pkey" PRIMARY KEY ("id")
);
