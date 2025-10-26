"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

    const handleNewAnalysis = () => {
        router.push("/new");
    };

  return (
    <header className="flex justify-between items-center p-4">
      <div>
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
    </header>
  );
}
