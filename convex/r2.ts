import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 configuration
// These should be set in Convex dashboard environment variables:
// - R2_ACCOUNT_ID: Your Cloudflare account ID
// - R2_ACCESS_KEY_ID: Your R2 access key ID
// - R2_SECRET_ACCESS_KEY: Your R2 secret access key
// - R2_BUCKET_NAME: Your R2 bucket name (e.g., "zgodbomat")
//
// Note: We use presigned URLs, so you don't need to configure public access on the bucket.

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'zgodbomat';

// Create S3 client configured for R2
function getR2Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      'R2 credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Convex dashboard environment variables.'
    );
  }

  // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
  const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: 'auto', // R2 uses 'auto' as the region
    endpoint,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Upload audio file to R2 storage and generate a presigned URL
 * @param audioData - ArrayBuffer containing the audio data
 * @param mimeType - MIME type of the audio file (e.g., 'audio/wav')
 * @param fileName - Optional custom file name. If not provided, a UUID will be generated
 * @returns Presigned URL to the uploaded file (valid for 7 days - R2 maximum)
 */
export async function uploadAudioToR2(
  audioData: ArrayBuffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  const client = getR2Client();

  // Generate file name if not provided
  const fileKey =
    fileName || `audio/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.wav`;

  // Upload to R2
  // Note: We use presigned URLs, so the bucket doesn't need to be public.
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: new Uint8Array(audioData),
    ContentType: mimeType,
  });

  try {
    await client.send(command);
    console.log(`Audio uploaded to R2: ${fileKey}`);

    // Generate a presigned URL that's valid for 7 days (maximum allowed by R2/S3)
    // Presigned URLs work without needing public bucket access
    // Note: R2 limits presigned URLs to 7 days maximum
    const getObjectCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(client, getObjectCommand, {
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds (maximum allowed)
    });

    console.log(`R2 presigned URL generated for: ${fileKey}`);
    return presignedUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload audio to R2: ${error.message}`);
    }
    throw new Error('Failed to upload audio to R2');
  }
}

/**
 * Generate a presigned URL for an existing R2 file
 * Use this to regenerate expired presigned URLs
 * @param fileKey - The R2 file key (path) of the file
 * @returns Presigned URL to the file (valid for 7 days)
 */
export async function getPresignedUrlForFile(fileKey: string): Promise<string> {
  const client = getR2Client();

  const getObjectCommand = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  const presignedUrl = await getSignedUrl(client, getObjectCommand, {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return presignedUrl;
}

/**
 * Extract the file key from a presigned R2 URL
 * @param presignedUrl - The presigned URL
 * @returns The file key (path) or null if extraction fails
 */
export function extractFileKeyFromUrl(presignedUrl: string): string | null {
  try {
    const url = new URL(presignedUrl);
    // R2 presigned URLs have the key in the pathname
    // Format: /bucket-name/file-key?signature...
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      // Remove bucket name, return the rest as the key
      return pathParts.slice(1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

