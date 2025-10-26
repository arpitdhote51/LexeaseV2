
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const GoogleIcon = () => (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);


export default function LoginPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                router.replace("/");
            }
        });
        return () => unsubscribe();
    }, [auth, router]);
    
    const handleGoogleSignIn = async () => {
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
                    <CardTitle>Welcome to LexEase</CardTitle>
                    <CardDescription>Your AI-powered legal co-pilot.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full text-base py-6 border-foreground/20">
                            <GoogleIcon />
                            Sign in with Google
                        </Button>
                         <Button onClick={handleGoogleSignIn} className="w-full text-base py-6">
                            Sign up with Google
                        </Button>
                    </div>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-muted"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground">OR</span>
                        <div className="flex-grow border-t border-muted"></div>
                    </div>

                    <Button asChild variant="secondary" className="w-full text-base py-6">
                        <Link href="/">Continue as Guest</Link>
                    </Button>
                </CardContent>
                 <CardFooter className="flex flex-col items-center justify-center pb-6">
                    <p className="text-xs text-muted-foreground text-center px-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <p className="text-sm font-bold text-foreground text-center mt-6">
                        Project by team CryptoCrew : GenAI Exchange Hackathon 2025
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
