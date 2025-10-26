
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M21.35 11.1H12.18v2.8h4.99c-.2 1.87-1.61 3.19-3.57 3.19-2.17 0-3.93-1.76-3.93-3.93s1.76-3.93 3.93-3.93c1.21 0 2.21.46 2.99 1.22l2.25-2.25C17.2 6.38 15.34 5.5 13.03 5.5c-3.4 0-6.17 2.77-6.17 6.17s2.77 6.17 6.17 6.17c3.48 0 5.92-2.48 5.92-6.04 0-.39-.04-.78-.1-1.15z"/>
    </svg>
);


export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/");
        }
    }, [user, loading, router]);
    
    const handleGoogleSignIn = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast({
                title: "Sign-in Successful",
                description: "Welcome back to LexEase!",
            });
            router.push("/");
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            toast({
                variant: "destructive",
                title: "Sign-in Failed",
                description: error.message || "An unexpected error occurred. Please try again.",
            });
        }
    };
    
    const handleGuest = () => {
        // This is a placeholder. In a real scenario, you might create an anonymous user.
        // For now, we'll just redirect, but the auth guard will kick them back.
        // A full guest implementation would require anonymous Firebase auth.
        toast({
            title: "Guest Mode",
            description: "You are continuing as a guest. Your data will not be saved.",
        });
        // This is where you would redirect to a guest-specific dashboard if you had one.
        // For now, we go to the main page. Proper implementation of guest sessions is needed.
         router.push("/");
    };

    if (loading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-2xl border-border">
                <CardHeader className="text-center">
                     <h1 className="text-3xl font-bold text-primary mx-auto mb-2">LexEase</h1>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Sign in to continue your work or proceed as a guest.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button onClick={handleGoogleSignIn} className="w-full text-base py-6">
                        <GoogleIcon />
                        Sign in with Google
                    </Button>
                    <Button onClick={handleGuest} variant="secondary" className="w-full text-base py-6">
                        Continue as Guest
                    </Button>
                    <p className="text-xs text-muted-foreground text-center px-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

    