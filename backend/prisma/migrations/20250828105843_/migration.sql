/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `subjectremin` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reminder" DROP COLUMN "subjectId",
ADD COLUMN     "subjectremin" TEXT NOT NULL;
