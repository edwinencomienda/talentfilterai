CREATE TABLE `jobs_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `applicants_table` ADD `timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL;