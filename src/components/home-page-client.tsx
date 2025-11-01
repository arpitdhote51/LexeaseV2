
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// This component now just redirects to the main /new page.
export default function HomePageClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/new");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-4">Loading LexEase...</p>
    </div>
  );
}
