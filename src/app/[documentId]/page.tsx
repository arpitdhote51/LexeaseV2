"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import LexeaseLayout from "@/components/layout/lexease-layout";

export default function DocumentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new analysis page as document history is disabled
    router.replace("/new");
  }, [router]);

  return (
    <LexeaseLayout>
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Redirecting...</p>
        </div>
    </LexeaseLayout>
  );
}
