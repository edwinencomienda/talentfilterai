import { db } from "@/db";
import { jobsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = "You are a helpful assistant.";

const getJobsList = async () => {
    const jobs = await db.select().from(jobsTable);
    return jobs
}

export interface AIResponse {
    job_id: number;
    reason: string;
    qualifications: {
        [key: string]: boolean;
    };
    qualificationPercentage: number;
}

export async function generateAIResponse(input: string): Promise<AIResponse> {
    const jobs = await getJobsList();

    const response = await client.responses.create({
        model: "gpt-4.1-nano",
        instructions: `
            You're an ai assistant that can parse an email from a job applicant.
            
            You have couple of things to do:
            1. Identify the job that the applicant is applying for. You can lookup from this list of jobs: "${JSON.stringify(jobs)}".
        
            # Matching guidelines:
            - You will determine the job that the applicant is applying for based on the job description and the applicant's application.
            - If you can't find a match return job_id: null.

            2. Based on the job description's qualifications, try to match it with the applicant's application. In the response, 
            if the applicant meets the qualification, mark it as true, otherwise mark it as false.
            
            3. Calculate the percentage of the applicant's application based on the job description's qualifications.
            
            4. Return the response as a JSON object with the following fields:
            {
                job_id: number,
                reason: string,
                qualifications: {
                    [key: string]: boolean;
                },
                qualificationPercentage: number,
            }

            make sure qualifications are not empty based on the job qualifications keys.
        `,
        input,
    });

    return JSON.parse(response.output_text);
}

export async function generateJobQualificationsAi(jobId: number) {
    const job = await db.query.jobsTable.findFirst({ where: eq(jobsTable.id, jobId) });
    if (!job) {
        return null;
    }
    const response = await client.responses.create({
        model: "gpt-4.1-nano",
        input: `
        Based on the job description: ${job.description}.
        
        If the description doesn't have any qualifications, return an empty array.
        
        Generate a list of qualifications required for the job in array format. like 
        [
            "Qualification 1",
            "Qualification 2",
            "Qualification 3"
        ]
        `,
    });
    return JSON.parse(response.output_text) as string[];
}
