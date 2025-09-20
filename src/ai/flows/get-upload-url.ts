
'use server';

/**
 * @fileOverview A Genkit flow to generate a signed URL for file uploads to GCS.
 *
 * - getUploadUrl - A function that returns a signed URL for uploading a file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const GetUploadUrlInputSchema = z.object({
  mimeType: z.string().describe('The MIME type of the file to be uploaded.'),
});
export type GetUploadUrlInput = z.infer<typeof GetUploadUrlInputSchema>;


const GetUploadUrlOutputSchema = z.object({
  uploadUrl: z.string().describe('The signed URL for the client to upload the file to.'),
  gcsUrl: z.string().describe('The GCS path of the file. Format: gs://<bucket>/<object>'),
});
export type GetUploadUrlOutput = z.infer<typeof GetUploadUrlOutputSchema>;

export async function getUploadUrl(input: GetUploadUrlInput): Promise<GetUploadUrlOutput> {
  return getUploadUrlFlow(input);
}

const getUploadUrlFlow = ai.defineFlow(
  {
    name: 'getUploadUrlFlow',
    inputSchema: GetUploadUrlInputSchema,
    outputSchema: GetUploadUrlOutputSchema,
  },
  async ({ mimeType }) => {
    const storage = new Storage();
    const bucketName = 'lexease-uploads'; // A dedicated bucket for uploads
    const fileName = `${uuidv4()}`; // Generate a unique file name

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: mimeType,
    };

    try {
      const bucket = storage.bucket(bucketName);
      const [uploadUrl] = await bucket.file(fileName).getSignedUrl(options);
      
      const gcsUrl = `gs://${bucketName}/${fileName}`;

      return { uploadUrl, gcsUrl };
    } catch (error) {
      console.error(`Failed to generate signed URL for GCS bucket "${bucketName}":`, error);
      throw new Error('Could not prepare file upload. Please try again later.');
    }
  }
);
