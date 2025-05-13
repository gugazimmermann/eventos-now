import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authLogger } from './logger';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export interface UploadFileParams {
  file: File;
  fileBuffer: ArrayBuffer;
  fileKey: string;
}

export async function uploadFileToS3({
  file,
  fileBuffer,
  fileKey,
}: UploadFileParams): Promise<string> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileKey,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
      })
    );

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (error) {
    authLogger.error('Failed to upload file to S3', {
      error,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileKey,
    });
    throw new Error('Erro ao fazer upload da imagem');
  }
}
