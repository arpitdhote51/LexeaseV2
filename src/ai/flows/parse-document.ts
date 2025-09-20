
'use server';

/**
 * @fileOverview A server-side flow for parsing document files (PDF, DOCX) from Google Cloud Storage.
 *
 * - parseDocument - A function that handles parsing the file content from GCS.
 * - ParseDocumentInput - The input type for the parseDocument function.
 * - ParseDocumentOutput - The return type for the parseDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const ParseDocumentInputSchema = z.object({
  gcsUrl: z.string().describe('The GCS path of the file to parse (e.g., gs://bucket/object).'),
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
    const storage = new Storage();
    
    // Extract bucket name and file name from GCS URL
    const urlMatch = gcsUrl.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!urlMatch) {
      throw new Error('Invalid GCS URL format. Expected gs://<bucket>/<object>.');
    }
    const bucketName = urlMatch[1];
    const fileName = urlMatch[2];

    let documentText = '';

    try {
      const file = storage.bucket(bucketName).file(fileName);
      const [metadata] = await file.getMetadata();
      const contentType = metadata.contentType;

      const [buffer] = await file.download();

      if (contentType === 'application/pdf') {
        const data = await pdf(buffer);
        documentText = data.text;
      } else if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        documentText = result.value;
      } else if (contentType === 'text/plain') {
        documentText = buffer.toString('utf8');
      } else {
        throw new Error(`Unsupported file type: ${contentType}`);
      }
    } catch (error) {
      console.error('Server-side parsing from GCS failed:', error);
      throw new Error(`Failed to parse the document from storage. Details: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { documentText };
  }
);
