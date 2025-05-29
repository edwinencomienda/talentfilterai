import { relations, sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const applicantsTable = sqliteTable("applicants_table", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    email: text().notNull(),
    job_id: int(),
    email_body: text().notNull(),
    meta: text(),
    status: text(),
    created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Jobs table
// fields: id,title,description,created_at
export const jobsTable = sqliteTable("jobs_table", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    description: text().notNull(),
    qualifications: text(),
    status: text().default("pending"),
    created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const jobsRelations = relations(jobsTable, ({ many }) => ({
    applications: many(applicantsTable),
}));

// attachments table
export const attachmentsTable = sqliteTable("attachments_table", {
    id: int().primaryKey({ autoIncrement: true }),
    applicant_id: int(),
    file_url: text().notNull(),
    file_name: text().notNull(),
    content_type: text().notNull(),
    size: int().notNull(),
    created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});


export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
    applicant: one(applicantsTable, {
        fields: [attachmentsTable.applicant_id],
        references: [applicantsTable.id],
    }),
}));

export const applicantsRelations = relations(applicantsTable, ({ one, many }) => ({
    job: one(jobsTable, {
        fields: [applicantsTable.job_id],
        references: [jobsTable.id],
    }),
    attachments: many(attachmentsTable)
}));