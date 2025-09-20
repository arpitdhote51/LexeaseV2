
'use server';

/**
 * @fileOverview A server-side flow for parsing document files (PDF, DOCX, TXT) from GCS.
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
  gcsUrl: z.string().describe('The GCS path to the file. Format: gs://<bucket>/<object>'),
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
    const urlParts = gcsUrl.replace('gs://', '').split('/');
    const bucketName = urlParts.shift()!;
    const fileName = urlParts.join('/');

    console.log(`Parsing from GCS: bucket='${bucketName}', file='${fileName}'`);

    const file = storage.bucket(bucketName).file(fileName);

    const [metadata] = await file.getMetadata();
    const mimeType = metadata.contentType;

    const [buffer] = await file.download();

    let documentText = '';

    try {
      if (mimeType === 'application/pdf') {
        const data = await pdf(buffer);
        documentText = data.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        documentText = result.value;
      } else if (mimeType === 'text/plain') {
        documentText = buffer.toString('utf8');
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Server-side parsing failed:', error);
      // Clean up the uploaded file on failure
      await file.delete();
      throw new Error(`Failed to parse the document on the server. The uploaded file has been deleted. Details: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Optional: Delete the file after successful parsing
    await file.delete();
    console.log(`Successfully parsed and deleted '${fileName}' from GCS.`);

    return { documentText };
  }
);
