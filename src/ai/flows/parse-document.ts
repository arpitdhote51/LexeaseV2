'use server';

/**
 * @fileOverview A server-side flow for parsing document files from Google Cloud Storage.
 *
 * - parseDocument - A function that handles parsing the file content from a GCS path.
 * - ParseDocumentInput - The input type for the parseDocument function.
 * - ParseDocumentOutput - The return type for the parseDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const ParseDocumentInputSchema = z.object({
  gcsUrl: z
    .string()
    .describe("The GCS URL of the file to parse. Expected format: 'gs://<bucket-name>/<object-name>'."),
});
export type ParseDocumentInput = z.infer<typeof ParseDocumentInputSchema>;

const ParseDocumentOutputSchema = z.object({
  documentText: z.string().describe('The extracted text content from the document.'),
});
export type ParseDocumentOutput = z.infer<typeof ParseDocumentOutputSchema>;

export async function parseDocument(input: ParseDocumentInput): Promise<ParseDocumentOutput> {
  return parseDocumentFlow(input);
}

const parseDocumentFlow = ai.defineFlow(
  {
    name: 'parseDocumentFlow',
    inputSchema: ParseDocumentInputSchema,
    outputSchema: ParseDocumentOutputSchema,
  },
  async ({ gcsUrl }) => {
    const urlParts = gcsUrl.replace('gs://', '').split('/');
    const bucketName = urlParts.shift();
    const objectName = urlParts.join('/');

    if (!bucketName || !objectName) {
      throw new Error('Invalid GCS URL format.');
    }

    let documentText = '';
    
    try {
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(objectName);

      const [metadata] = await file.getMetadata();
      const mimeType = metadata.contentType;
      
      const [buffer] = await file.download();

      if (mimeType === 'application/pdf') {
          const data = await pdf(buffer);
          documentText = data.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer });
          documentText = result.value;
      } else if (mimeType && mimeType.startsWith('text/')) {
          documentText = buffer.toString('utf8');
      } else {
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
      
      // Clean up the uploaded file after parsing
      await file.delete();

    } catch (error) {
        console.error('Server-side parsing from GCS failed:', error);
        throw new Error(`Failed to read or parse the document from storage. Details: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { documentText };
  }
);
