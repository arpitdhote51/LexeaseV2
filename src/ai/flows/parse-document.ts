'use server';

/**
 * @fileOverview A robust server-side flow for parsing document files from Google Cloud Storage.
 *
 * - parseDocument - A function that handles parsing the file content from GCS.
 * - ParseDocumentInput - The input type for the parseDocument function.
 * - ParseDocumentOutput - The return type for the aparseDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Storage } from '@google-cloud/storage';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import pdfParse from 'pdf-parse';
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
        try {
          // Primary method: Use pdfjs-dist, converting Buffer to Uint8Array
          const uint8array = new Uint8Array(buffer);
          const pdfDoc = await pdfjs.getDocument({ data: uint8array }).promise;
          let text = '';
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
          }
          documentText = text;
        } catch (pdfjsError) {
          console.warn('pdfjs-dist failed to parse, falling back to pdf-parse.', pdfjsError);
          // Fallback method: Use pdf-parse
          const data = await pdfParse(buffer);
          documentText = data.text;
        }
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