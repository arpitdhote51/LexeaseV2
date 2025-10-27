"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import LexeaseLayout from "@/components/layout/lexease-layout";

// This page is a fallback. Since authentication is removed, we redirect any traffic
// that lands here to the main application page.
export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
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
