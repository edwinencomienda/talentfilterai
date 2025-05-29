DROP INDEX "applicants_table_email_unique";--> statement-breakpoint
ALTER TABLE `applicants_table` ALTER COLUMN "job_id" TO "job_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `applicants_table_email_unique` ON `applicants_table` (`email`);