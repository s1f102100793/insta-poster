import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../service/s3Client';
import { env } from '../env';

export const s3 = {
  upload: async (directoryName: string, imageBuffer: Buffer) => {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: directoryName,
        Body: imageBuffer,
      })
    );
    const url = `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${directoryName}`;
    return url;
  },
};
