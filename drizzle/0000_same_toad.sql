CREATE TABLE `applicants_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`job_id` integer NOT NULL,
	`email_body` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applicants_table_email_unique` ON `applicants_table` (`email`);