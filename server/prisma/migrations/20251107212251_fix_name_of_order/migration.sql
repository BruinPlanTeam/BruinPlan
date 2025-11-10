/*
  Warnings:

  - You are about to drop the column `order` on the `MajorRequirement` table. All the data in the column will be lost.
  - Added the required column `displayOrder` to the `MajorRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MajorRequirement` DROP COLUMN `order`,
    ADD COLUMN `displayOrder` INTEGER NOT NULL;
