import { db } from "@/db";
import { applicantsTable, attachmentsTable } from "@/db/schema";
import { AIResponse, generateAIResponse } from "@/lib/openai";
import { uploadFile } from "@/lib/r2";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";


interface Attachment {
    Content: string
    Name: string
    ContentID: string
    ContentLength: number
    ContentType: string
}

const handleGenerateRandomFileName = (contentType: string) => {
    const extension = contentType.split("/")[1]
    return `${Date.now()}.${extension}`
}

const handleUploadAttachments = (applicantId: number, attachments: Attachment[]) => {
    if (!attachments?.length) {
        return
    }

    attachments.forEach(async (attachment: Attachment) => {
        try {
            const fileName = `attachments/${handleGenerateRandomFileName(attachment.ContentType)}`
            const fileUrl = await uploadFile(
                fileName,
                Buffer.from(attachment.Content, "base64"),
                attachment.ContentType
            )
            await db.insert(attachmentsTable).values({
                applicant_id: applicantId,
                file_url: fileUrl,
                file_name: attachment.Name,
                content_type: attachment.ContentType,
                size: attachment.ContentLength,
            })
        } catch (error) {
            console.log("uploadFile error", error)
        }
    })
}

export async function POST(request: Request) {
    console.log("email inbound parse received")
    const body = await request.json();

    const aiResponse: AIResponse = await generateAIResponse(body.TextBody);

    if (!aiResponse.job_id) {
        console.log("job not found")

        return NextResponse.json({
            error: "Job not found",
        });
    }

    const existingApplicant = await db.query.applicantsTable.findFirst({
        where: and(eq(applicantsTable.email, body.From), eq(applicantsTable.job_id, aiResponse.job_id)),
    })
    if (existingApplicant) {
        const res = await db.update(applicantsTable)
            .set({
                job_id: aiResponse.job_id,
                meta: JSON.stringify(aiResponse),
            })
            .where(eq(applicantsTable.email, body.From))
            .returning();

        handleUploadAttachments(res[0].id, body.Attachments)

        console.log("existing applicant", res)

        return NextResponse.json({
            applicant: res[0],
        })
    }

    const [applicant] = await db.insert(applicantsTable).values({
        name: body.FromName,
        email: body.From,
        email_body: body.TextBody,
        job_id: aiResponse.job_id,
        meta: JSON.stringify(aiResponse),
    })
        .returning();

    applicant.meta = JSON.parse(applicant.meta || "{}");

    handleUploadAttachments(applicant.id, body.Attachments)

    console.log("new applicant", applicant)

    return NextResponse.json({
        applicant,
    })
}