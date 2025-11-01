# LexEase - Your AI-Powered Legal Co-Pilot

This is a Next.js project for an AI-powered legal assistant called LexEase, created in Firebase Studio. It allows users to upload legal documents and receive a comprehensive, multi-faceted analysis powered by Google's Gemini models.

## Key Features

*   **Privacy-First**: No login or user account required. Upload documents and get analysis anonymously.
*   **Multi-Faceted AI Analysis**:
    *   **Plain Language Summary**: Simplifies complex legal text into an easy-to-understand summary, tailored for different user roles (Layperson, Law Student, Lawyer).
    *   **Key Entity Recognition**: Automatically extracts and categorizes parties, dates, locations, monetary values, and more.
    *   **Risk Flagging**: Scans the document for potentially risky, unusual, or problematic clauses.
    *   **Strategic Advisor**: Provides a dual-perspective analysis from both a defendant's and a prosecutor's point of view, including case strength scores and actionable strategies.
*   **Interactive Q&A**: A chat interface to ask specific questions about the analyzed document.
*   **Multilingual Support**: Get analysis results in multiple languages, including English, Hindi, Marathi, and Kannada.
*   **PDF Report Download**: Download a complete, professionally formatted PDF report of the entire analysis.
*   **AI Document Drafting**: Generate formatted legal documents (like Affidavits or Rent Agreements) from simple, plain-text details.

For a detailed overview of the project architecture, features, and technology stack, please see the [**LexEase High-Level Technical Specification (LEGACY_README.md)**](./LEGACY_README.md).

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Installation & Setup

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your-username/lexease.git
    cd lexease
    ```

2.  **Install NPM packages**
    ```sh
    npm install
    ```

3.  **Set up your environment variables**
    The application uses Google's Generative AI. You'll need a Gemini API key for the AI features to work.

    *   Create an environment file:
        ```sh
        touch .env
        ```
    *   Open the newly created `.env` file and add your API key:
        ```
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```
    *   You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Development Server

Once the installation is complete, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will automatically redirect to the `/new` analysis page.
