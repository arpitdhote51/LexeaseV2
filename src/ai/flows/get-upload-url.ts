
'use server';

/**
 * @fileOverview A Genkit flow to generate a secure, short-lived URL for uploading a file to Google Cloud Storage.
 *
 * - getUploadUrl - A function that returns a signed URL for a client-side file upload.
 * - GetUploadUrlInput - The input type for the getUploadUrl function.
 * - GetUploadUrlOutput - The return type for the getUploadUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const GetUploadUrlInputSchema = z.object({
  fileName: z.string().describe('The name of the file to be uploaded.'),
  contentType: z.string().describe('The MIME type of the file (e.g., "application/pdf").'),
});
export type GetUploadUrlInput = z.infer<typeof GetUploadUrlInputSchema>;

const GetUploadUrlOutputSchema = z.object({
  uploadUrl: z.string().describe('The secure URL to which the client should upload the file.'),
  gcsUrl: z.string().describe('The GCS path of the file once uploaded (gs://bucket/object).'),
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
  async ({ fileName, contentType }) => {
    try {
      const storage = new Storage();
      const bucketName = 'lexease-uploads'; 
      const bucket = storage.bucket(bucketName);
      
      const uniqueFileName = `${uuidv4()}-${fileName}`;
      const file = bucket.file(uniqueFileName);
      
      const gcsUrl = `gs://${bucketName}/${uniqueFileName}`;

      const options = {
        version: 'v4' as const,
        action: 'write' as const,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
      };

      const [uploadUrl] = await file.getSignedUrl(options);

      return { uploadUrl, gcsUrl };
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Could not prepare file upload. Please try again later. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
