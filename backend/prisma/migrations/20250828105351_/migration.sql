/*
  Warnings:

  - You are about to drop the column `sent` on the `Reminder` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reminder" DROP COLUMN "sent",
DROP COLUMN "subject",
ADD COLUMN     "subjectId" TEXT NOT NULL,
ALTER COLUMN "remindTime" SET DATA TYPE TEXT;
