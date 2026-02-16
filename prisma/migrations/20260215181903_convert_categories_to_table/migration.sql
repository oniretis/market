/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'PRODUCT_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'PRODUCT_DELETED';

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Insert default categories
INSERT INTO "Category" (id, name, description, color, "createdAt", "updatedAt") VALUES
('properties', 'properties', 'Real estate properties and rentals', '#10B981', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('gadgets', 'gadgets', 'Electronics and tech gadgets', '#3B82F6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cars', 'cars', 'Vehicles and automotive products', '#F59E0B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('others', 'others', 'Miscellaneous products', '#8B5CF6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

-- Update existing products to reference the new categories
UPDATE "Product" SET "categoryId" = 
  CASE "category"
    WHEN 'properties' THEN 'properties'
    WHEN 'gadgets' THEN 'gadgets'
    WHEN 'cars' THEN 'cars'
    WHEN 'others' THEN 'others'
    ELSE 'others'
  END;

-- Make categoryId required after data migration
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- Drop the old category column
ALTER TABLE "Product" DROP COLUMN "category";

-- DropEnum
DROP TYPE "CategoryTypes";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
