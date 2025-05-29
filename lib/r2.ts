import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "auto",
    endpoint: "https://a8ff9c451998ca7e86bc4cdb6d0a1bc1.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY as string,
        secretAccessKey: process.env.R2_SECRET_KEY as string,
    },
});


export const listObjects = async () => {
    const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME as string,
    })

    const response = await s3.send(command)

    return response.Contents
}

export const uploadFile = async (fileName: string, fileContents: any, contentType?: string): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME as string,
        Key: fileName,
        Body: fileContents,
        ACL: 'public-read',
        ContentType: contentType,
    })

    const fileUrl = `${process.env.R2_BUCKET_PUBLIC_URL}/${fileName}`
    await s3.send(command)

    return fileUrl
}
