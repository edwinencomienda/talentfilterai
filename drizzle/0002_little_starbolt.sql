ALTER TABLE `applicants_table` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `applicants_table` DROP COLUMN `timestamp`;--> statement-breakpoint
ALTER TABLE `jobs_table` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs_table` DROP COLUMN `timestamp`;