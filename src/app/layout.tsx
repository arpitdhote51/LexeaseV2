
"use client";
import "@/app/globals.css";
import AuthProvider from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RootLayoutProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.replace('/login');
        }
    }, [user, loading, router, pathname]);

    if (loading || (!user && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return <>{children}</>;
};


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`font-body antialiased`}>
        <AuthProvider>
            <AuthWrapper>
                {children}
            </AuthWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

    