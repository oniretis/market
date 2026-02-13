/*
  Warnings:

  - You are about to drop the column `productFile` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `connectedAccountId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeConnectedLinked` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_connectedAccountId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productFile",
ADD COLUMN     "productVideo" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "connectedAccountId",
DROP COLUMN "stripeConnectedLinked";
