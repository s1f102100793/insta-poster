import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../service/s3Client';
import { env } from '../env';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = {
  upload: async (directoryName: string, imageBuffer: Buffer) => {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: directoryName,
        Body: imageBuffer,
        ContentType: 'image/jpeg'
      })
    );
    const url = `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${directoryName}`;
    return url;
  },
  generatePresignedUrl: async (objectKey: string) => {
    const expirationInSeconds = 7200;
    const getObjectParams = {
      Bucket: env.S3_BUCKET,
      Key: objectKey,
    };
    const command = new GetObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationInSeconds });
    return signedUrl;
  }
};
