/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Reminder` table. All the data in the column will be lost.
  - Added the required column `subject` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `remindTime` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Reminder" DROP COLUMN "subjectId",
ADD COLUMN     "sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject" TEXT NOT NULL,
DROP COLUMN "remindTime",
ADD COLUMN     "remindTime" TIMESTAMP(3) NOT NULL;
