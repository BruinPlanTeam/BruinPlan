-- CreateTable
CREATE TABLE `RequirementGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `highNumberInReq` INTEGER NOT NULL,
    `lowNumberInReq` INTEGER NOT NULL,
    `numberOfHighReqs` INTEGER NOT NULL,
    `numberOfLowReqs` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequirementsInGroup` (
    `reqId` INTEGER NOT NULL,
    `reqGroupId` INTEGER NOT NULL,

    PRIMARY KEY (`reqId`, `reqGroupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequirementsInGroup` ADD CONSTRAINT `RequirementsInGroup_reqId_fkey` FOREIGN KEY (`reqId`) REFERENCES `Requirement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequirementsInGroup` ADD CONSTRAINT `RequirementsInGroup_reqGroupId_fkey` FOREIGN KEY (`reqGroupId`) REFERENCES `RequirementGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
