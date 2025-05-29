import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { applicantsRelations, applicantsTable, attachmentsRelations, attachmentsTable, jobsRelations, jobsTable } from './schema';

// You can specify any property from the libsql connection options
export const db = drizzle({
    connection: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!
    },
    schema: {
        jobsTable,
        applicantsTable,
        applicantsRelations,
        jobsRelations,
        attachmentsTable,
        attachmentsRelations
    }
});
