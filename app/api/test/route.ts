import { sendPostmarkEmail } from "@/lib/postmark";
import { listObjects, uploadFile } from "@/lib/r2";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return NextResponse.json({
        "message": "ok"
    })
}