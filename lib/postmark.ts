import fetch from 'node-fetch';

interface SendEmailParams {
    from: string;
    to: string;
    templateId: string;
    templateModel: Record<string, string>;
}

export async function sendPostmarkEmail({
    from,
    to,
    templateId,
    templateModel,
}: SendEmailParams): Promise<any> {
    const response = await fetch('https://api.postmarkapp.com/email/withTemplate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': process.env.POSTMARK_API_TOKEN!,
        },
        body: JSON.stringify({
            From: from,
            To: to,
            TemplateId: templateId,
            TemplateModel: templateModel,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Postmark API error: ${response.status} ${error}`);
    }

    return response.json();
}