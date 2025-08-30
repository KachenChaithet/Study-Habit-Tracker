/*
  Warnings:

  - Made the column `subjectId` on table `Reminder` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Reminder" ALTER COLUMN "subjectId" SET NOT NULL,
ALTER COLUMN "subjectId" SET DATA TYPE TEXT;
