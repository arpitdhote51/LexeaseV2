
"use client";
import dynamic from "next/dynamic";
import LexeaseLayout from "@/components/layout/lexease-layout";

const LexeaseApp = dynamic(() => import("@/components/lexease-app"), { ssr: false });

export default function NewAnalysisPage() {
  return (
    <LexeaseLayout>
      <LexeaseApp />
    </LexeaseLayout>
  );
}
