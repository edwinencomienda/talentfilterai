"use server"

import { db } from "@/db";
import { applicantsTable, jobsTable } from "@/db/schema";
import { generateJobQualificationsAi } from "@/lib/openai";
import { sendPostmarkEmail } from "@/lib/postmark";
import { eq } from "drizzle-orm";

export const getJobsList = async () => {
    const jobs = await db.query.jobsTable.findMany({
        orderBy: (jobsTable, { desc }) => [desc(jobsTable.created_at)],
        with: {
            applications: {
                orderBy: (applicationsTable, { desc }) => [desc(applicationsTable.created_at)],
            },
        }
    })
    return jobs
}

export const createJob = async (title: string, description: string, status: string) => {
    const [job] = await db.insert(jobsTable).values({
        title,
        description,
        status,
    }).returning()

    return job
}

export const updateJob = async (id: number, title: string, description: string, status: string) => {
    const [job] = await db.update(jobsTable).set({
        title,
        description,
        status,
    }).where(eq(jobsTable.id, id)).returning()

    return job
}

export const deleteJob = async (id: number) => {
    await db.delete(jobsTable).where(eq(jobsTable.id, id))
}

export const getJob = async (id: number) => {
    const job = await db.query.jobsTable.findFirst({
        where: eq(jobsTable.id, id),
        with: {
            applications: {
                orderBy: (applicationsTable, { desc }) => [desc(applicationsTable.created_at)],
                with: {
                    attachments: true
                }
            },
        }
    })
    return job
}

export const updateApplicantStatus = async (applicantId: number, status?: string) => {
    await db.update(applicantsTable).set({
        status: status || null,
    }).where(eq(applicantsTable.id, applicantId))
}

export const generateJobQualifications = async (jobId: number) => {
    const job = await db.query.jobsTable.findFirst({
        where: eq(jobsTable.id, jobId),
    })
    if (!job) {
        return null
    }
    const qualifications = await generateJobQualificationsAi(jobId)
    await db.update(jobsTable).set({
        qualifications: JSON.stringify(qualifications),
    }).where(eq(jobsTable.id, jobId))
}


export const sendShortlistedEmail = async (jobId: number, applicantId: number) => {
    const job = await db.query.jobsTable.findFirst({
        where: eq(jobsTable.id, jobId),
    })
    if (!job) {
        return null
    }
    const applicant = await db.query.applicantsTable.findFirst({
        where: eq(applicantsTable.id, applicantId),
    })
    if (!applicant) {
        return null
    }
    await sendPostmarkEmail({
        from: "talentfilterai@kuyaedwin.com",
        to: "dev@kuyaedwin.com",
        // to: applicant.email,
        templateId: "40221883",
        templateModel: {
            "applicantName": applicant.name,
            "jobTitle": job.title,
        }
    })
}