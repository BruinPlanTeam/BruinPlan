-- this migration is an approx of what would have been run if I didn't pull the changes from a modified db

-- CreateTable: MajorRequirementGroup
CREATE TABLE `MajorRequirementGroup` (
    `majorId` INTEGER NOT NULL,
    `requirementGroupId` INTEGER NOT NULL,

    PRIMARY KEY (`majorId`, `requirementGroupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: Major - Remove school column
ALTER TABLE `Major` DROP COLUMN `school`;

-- AlterTable: Prereq - Update structure
-- Drop old primary key and constraints
ALTER TABLE `Prereq` DROP PRIMARY KEY;
ALTER TABLE `Prereq` DROP FOREIGN KEY `Prereq_ibfk_1`;
ALTER TABLE `Prereq` DROP FOREIGN KEY `Prereq_ibfk_2`;
ALTER TABLE `Prereq` DROP INDEX `requiredForId`;

-- Add new column
ALTER TABLE `Prereq` ADD COLUMN `prereqGroupNumber` INTEGER NOT NULL;

-- Add new primary key
ALTER TABLE `Prereq` ADD PRIMARY KEY (`requiredForId`, `prereqId`, `prereqGroupNumber`);

-- Add new index
CREATE INDEX `prereqId` ON `Prereq`(`prereqId`);

-- Add new foreign keys
ALTER TABLE `Prereq` ADD CONSTRAINT `Prereq_ibfk_1` FOREIGN KEY (`requiredForId`) REFERENCES `Class`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `Prereq` ADD CONSTRAINT `Prereq_ibfk_2` FOREIGN KEY (`prereqId`) REFERENCES `Class`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AlterTable: Requirement - Remove type column
ALTER TABLE `Requirement` DROP COLUMN `type`;

-- AlterTable: RequirementGroup - Update columns
ALTER TABLE `RequirementGroup` DROP COLUMN `highNumberInReq`;
ALTER TABLE `RequirementGroup` DROP COLUMN `lowNumberInReq`;
ALTER TABLE `RequirementGroup` DROP COLUMN `numberOfHighReqs`;
ALTER TABLE `RequirementGroup` DROP COLUMN `numberOfLowReqs`;
ALTER TABLE `RequirementGroup` DROP COLUMN `total`;
ALTER TABLE `RequirementGroup` ADD COLUMN `numRequirementsToChoose` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `RequirementGroup` ADD COLUMN `type` VARCHAR(50) NULL;

-- AddForeignKey: MajorRequirementGroup
ALTER TABLE `MajorRequirementGroup` ADD CONSTRAINT `MajorRequirementGroup_ibfk_1` FOREIGN KEY (`majorId`) REFERENCES `Major`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `MajorRequirementGroup` ADD CONSTRAINT `MajorRequirementGroup_ibfk_2` FOREIGN KEY (`requirementGroupId`) REFERENCES `RequirementGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: MajorRequirementGroup
CREATE INDEX `requirementGroupId` ON `MajorRequirementGroup`(`requirementGroupId`);
