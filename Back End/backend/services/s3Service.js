import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
  },
});

export const generateUploadURL = async (fileType) => {
  try {
    const rawBytes = crypto.randomBytes(16);
    const imageName = rawBytes.toString('hex');
    
    // Determine extension based on common fileTypes or just default to bin
    let ext = '';
    if (fileType.includes('jpeg') || fileType.includes('jpg')) ext = '.jpg';
    else if (fileType.includes('png')) ext = '.png';
    else if (fileType.includes('mp4')) ext = '.mp4';
    else if (fileType.includes('pdf')) ext = '.pdf';

    const key = `incidents/${imageName}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'safe-kwasu-media',
      Key: key,
      ContentType: fileType,
    });

    // URL expires in 5 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // The public URL assuming public-read bucket or CDN
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl, key };
  } catch (error) {
    logger.error('Error generating S3 presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};
