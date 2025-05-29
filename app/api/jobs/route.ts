import { db } from "@/db";
import { NextResponse } from "next/server";
import { jobsTable } from "@/db/schema";

export async function GET() {
    const jobs = await db.select().from(jobsTable);
    return NextResponse.json(jobs);
}