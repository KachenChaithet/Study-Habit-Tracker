/*
  Warnings:

  - Changed the type of `remindTime` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Reminder" DROP COLUMN "remindTime",
ADD COLUMN     "remindTime" TIMESTAMP(3) NOT NULL;
