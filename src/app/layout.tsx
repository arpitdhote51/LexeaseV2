
"use client";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { type ReactNode, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // No user, sign in anonymously
        signInAnonymously(auth).catch(error => {
          console.error("Anonymous sign-in failed:", error);
          // Handle error, maybe show an error message
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Initializing secure session...</p>
      </div>
    );
  }

  return <>{children}</>;
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`font-body antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
