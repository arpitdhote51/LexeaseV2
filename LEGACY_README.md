# LexEase Application Overview

This document provides a detailed overview of the LexEase application, including its architecture, the technologies used, its features, and key process flows.

## 1. Technologies Used

The application is built on a modern, robust tech stack designed for performance and scalability.

- **Frontend:**
  - **Next.js:** A React framework for building server-rendered and statically generated web applications.
  - **React & TypeScript:** For building a type-safe, component-based user interface.
  - **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
  - **ShadCN UI:** A collection of beautifully designed, accessible, and reusable UI components.

- **Backend & AI Integration:**
  - **Genkit:** An open-source framework from Google for building production-ready AI-powered applications.
  - **Google AI (Gemini Models):** The underlying Large Language Models (LLMs) used for all generative AI tasks, including summarization, entity recognition, Q&A, and drafting.
  - **Next.js Server Actions:** Used to securely call server-side AI flows from the client.

- **Storage & Database:**
  - The application is architected to be stateless regarding user data. No user accounts or document history are stored.

- **Client-Side Libraries:**
  - **`pdfjs-dist`:** For parsing and extracting text from PDF files directly in the browser.
  - **`mammoth`:** For parsing and extracting text from DOCX files in the browser.
  - **`jspdf` & `jspdf-autotable`:** For generating and downloading analysis reports as PDF files on the client side.

---

## 2. Architecture Diagram

The application follows a simple, stateless client-server architecture where the Next.js frontend communicates with a Genkit-powered AI backend via Server Actions.

```
+----------------+      +-------------------------+      +--------------------+
|                |      |                         |      |                    |
| User's Browser |----->|  Next.js Frontend       |----->| Next.js Backend    |
| (React/Next.js)|      |  (React Components, UI) |      | (Server Actions)   |
|                |      |                         |      |                    |
+----------------+      +-------------------------+      +----------+---------+
                                                                    |
                                                                    v
                                                        +-----------+-----------+
                                                        |                       |
                                                        |   Genkit AI Flows     |
                                                        |   (Server-side)       |
                                                        |                       |
                                                        +-----------+-----------+
                                                                    |
                                                                    v
                                                        +-----------+-----------+
                                                        |                       |
                                                        |  Google AI (Gemini)   |
                                                        |  (LLM for Analysis)   |
                                                        |                       |
                                                        +-----------------------+

```
**Data Flow Explanation:**
1.  The user interacts with the UI in their browser on the `/new` page.
2.  Frontend components handle user input (e.g., file uploads, language selection).
3.  Client-side libraries (`pdfjs`, `mammoth`) parse uploaded documents to extract text.
4.  When an AI-powered action is triggered (e.g., "Analyze Document"), a Next.js Server Action is called.
5.  The Server Action invokes the appropriate Genkit AI flows on the server.
6.  The Genkit flow communicates with the Google AI (Gemini) model, sending it the document text and a prompt.
7.  The AI model processes the request and returns structured data (JSON).
8.  The AI flow sends the result back to the frontend, which updates the UI to display the complete analysis.

---

## 3. Wireframes / Mock Diagrams

This section describes the layout and structure of the main application screens.

### Main Layout
The application uses a consistent two-panel layout.
- **Left Sidebar:** A persistent navigation bar with links to major sections:
  - `New Analysis`
  - `New Draft`
  - `Consult a Lawyer`
  - `Learn Law`
  - `About Us`
  - `Contact Us`
- **Main Content Area:** The primary workspace that changes based on the selected navigation link.

### Screen Mockups

#### A. Document Analysis Screen (`/new`)
A single-column, spacious layout.
```
+-----------------------------------------------------------------------------+
| [Sidebar]          | [Main Content Area]                                    |
|--------------------|--------------------------------------------------------|
| - New Analysis     | [Document Input Card - Full Width]                     |
| - New Draft        | +----------------------------------------------------+ |
| - Consult Lawyer   | | Drag & Drop File Upload                            | |
| - ...              | | Language: [Select: English, Hindi, etc.]           | |
|                    | | Role: [Radio: Layperson, Law Student, Lawyer]      | |
|                    | | [Analyze Document] Button                          | |
|                    | +----------------------------------------------------+ |
|                    |                                                        |
|                    | [Analysis Results Card - Full Width, Appears After]    |
|                    | +----------------------------------------------------+ |
|                    | | [Tabs: Summary | Strategic Advisor | Key Entities]  | |
|                    | |                                                    | |
|                    | | [Tab Content Displayed Here...]                    | |
|                    | |                                                    | |
|                    | | [Download Report] Button                           | |
|                    | +----------------------------------------------------+ |
|                    |                                                        |
+-----------------------------------------------------------------------------+
```

#### B. Document Drafting Screen (`/draft`)
```
+-----------------------------------------------------------------------------+
| [Sidebar]          | [Main Content Area]                                    |
|--------------------|--------------------------------------------------------|
| - New Analysis     | [Drafting Inputs Card]       | [Generated Draft Card]  |
| - New Draft        |                            |                         |
| - ...              | +------------------------+ | +---------------------+ |
|                    | | Doc Type: [Select...]  | | | Your generated      | |
|                    | | Language: [Select...]  | | | draft will appear   | |
|                    | |                        | | | here...             | |
|                    | | Details: [Textarea...] | | |                     | |
|                    | |                        | | | [Download .txt] Btn | |
|                    | | [Generate Draft] Btn   | | | [Download .pdf] Btn | |
|                    | +------------------------+ | +---------------------+ |
|                    |                            |                         |
+-----------------------------------------------------------------------------+
```

---

## 4. Process Flow Diagram

This diagram illustrates the end-to-end process for analyzing a legal document.

```
(Start)
   |
   v
[User lands on the "New Analysis" page]
   |
   v
[User uploads a document (PDF, DOCX, or TXT)]
   |
   v
[Client-side JavaScript parses the file and extracts raw text]
   |
   v
[User selects their role and analysis language]
   |
   v
[User clicks "Analyze Document"]
   |
   v
[A Server Action is called, passing the document text, user role, and language]
   |
   v
[Server runs four AI flows in parallel:]
   |
   +-----> [plainLanguageSummarization]: Generates a simple summary.
   +-----> [keyEntityRecognition]: Extracts parties, dates, etc.
   +-----> [riskFlagging]: Identifies risky clauses.
   +-----> [strategicAdvisorAgent]: Provides dual-perspective strategic advice.
   |
   v
[All AI results are combined into a single JSON object]
   |
   v
[Results are sent back to the client]
   |
   v
[UI updates to display the full analysis in their respective tabs]
   |
   v
[User can optionally download the complete analysis as a PDF report]
   |
   v
(End)
```

---

## 5. List of Features

### Core Features
- **Stateless & Anonymous**: No user accounts or login required, ensuring maximum user privacy.
- **Document Upload & Parsing:** Users can upload legal documents in `.pdf`, `.docx`, and `.txt` formats. The app parses these files in the browser to extract text content.
- **AI-Powered Document Analysis:**
  - **Plain Language Summary:** Generates an easy-to-understand summary of complex legal text, tailored to the user's selected role (Layperson, Law Student, or Lawyer).
  - **Key Entity Recognition:** Automatically identifies and categorizes key entities such as parties, dates, locations, and monetary amounts.
  - **Risk Flagging:** Scans the document for potentially risky, unusual, or problematic clauses and highlights them for the user.
  - **Strategic Advisor Agent**: A powerful dual-perspective analysis providing strategic advice for both the defendant/accused and the prosecutor/victim, complete with case strength scores and actionable recommendations.
- **Interactive Q&A:** A chat interface where users can ask specific questions about the analyzed document. The AI provides answers based on the document's content.
- **AI-Powered Document Drafting:**
  - Users can select a document type (e.g., Affidavit) and language.
  - By providing unstructured details, the AI drafts a formatted legal document.
- **Multilingual Support**: The entire AI analysis can be generated in multiple languages, including English, Hindi, Marathi, and Kannada.
- **Downloadable PDF Reports & Drafts**:
  - Generated analysis can be downloaded as a single, comprehensive, and professionally styled PDF report.
  - Generated drafts can be downloaded as both `.txt` and `.pdf` files.

### Supporting Features
- **Speech-to-Text (STT):** The Q&A chat includes a "mic" button for voice input.
- **Static Content Pages:**
  - **Consult a Lawyer:** A page displaying a list of fictional lawyers for consultation booking (demonstration feature).
  - **Learn Law:** A page with a gallery of educational legal videos.
  - **About & Contact:** Static pages providing information about the company and how to get in touch.
- **Client-Side Routing:** A responsive, single-page application experience powered by Next.js routing.
- **Responsive Design:** The UI is designed to be usable across different screen sizes.
