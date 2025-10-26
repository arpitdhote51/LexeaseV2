
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Scale, Search, FileText, Languages, Shield, ArrowRight, Moon, Sun, User, LogOut } from "lucide-react";
import LexyChat from "@/components/lexy-chat";
import { Suspense, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getAuth, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { app } from "@/lib/firebase";

const features = [
  {
    icon: BookOpen,
    title: "Up-to-Date Knowledge Base",
    description: "Access all Central and major State statutes, rules, regulations, and current judicial decisions from top courts and tribunals.",
  },
  {
    icon: Scale,
    title: "Procedural Law Expertise",
    description: "Understands and applies civil, criminal, and tribunal procedural laws, including limitation periods and e-filing protocols.",
  },
  {
    icon: Search,
    title: "Precise Legal Research",
    description: "Locates headnotes, ratio decidendi, and dicta with accurate Indian citation conventions (SCC, AIR, CriLJ).",
  },
  {
    icon: FileText,
    title: "Advanced Document Drafting",
    description: "Drafts petitions, briefs, contracts, and notices using standardized Indian clause libraries with version control.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Offers support in English, Hindi, and regional languages, understanding legal idioms and local court etiquettes.",
  },
  {
    icon: Shield,
    title: "Confidentiality & Compliance",
    description: "Ensures strict confidentiality, performs conflict checks, and complies with the DPDP Act to mitigate bias.",
  },
];

export default function HomePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [theme, setTheme] = useState('light');
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };
  
  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-card border-b text-card-foreground">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <h1 className="text-2xl font-bold text-primary font-headline">LexEase</h1>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/new" className="text-sm font-medium hover:underline underline-offset-4 text-foreground" prefetch={false}>
            Start Analysis
          </Link>
          <Link href="/draft" className="text-sm font-medium hover:underline underline-offset-4 text-foreground" prefetch={false}>
            Draft Document
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4 text-foreground" prefetch={false}>
            About
          </Link>
          
          <div className="flex items-center gap-2">
            <Select onValueChange={handleThemeChange} value={theme}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-4 w-4"/> Light</div></SelectItem>
                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-4 w-4"/> Dark</div></SelectItem>
                </SelectContent>
            </Select>
            <Select defaultValue="en">
                <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
            </Select>
            
            {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                                <AvatarFallback>
                                    {user.displayName ? user.displayName.charAt(0) : <User />}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email || "No email"}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : <Button asChild variant="outline" size="sm"><Link href="/login">Sign In</Link></Button> }
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl xl:text-6xl/none font-headline">
                Your AI-Powered Co-Pilot for Modern India
              </h1>
              <p className="text-muted-foreground md:text-xl">
                LexEase is a highly capable AI assistant. Ask Lexy anything below.
              </p>
            </div>
            <div className="w-full max-w-4xl mt-10 h-[500px]">
              <Suspense fallback={<div className="w-full h-full bg-card/50 shadow-lg rounded-2xl border border-border/50 backdrop-blur-sm animate-pulse" />}>
                <LexyChat />
              </Suspense>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Capabilities</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">
                  Designed for Modern India
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LexEase integrates powerful AI with a deep understanding of India's legal landscape to provide unparalleled support.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 pt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border shadow-none hover:shadow-lg transition-shadow bg-card hover:bg-muted text-card-foreground">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-accent/10 p-3 rounded-full">
                            <feature.icon className="h-6 w-6 text-accent" />
                        </div>
                        <CardTitle className="text-lg font-bold text-card-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/new">
                      Analyze a Document
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary font-headline">
                Streamline Your Legal Workflow Today
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Leverage the power of AI to conduct faster research, draft more efficiently, and build stronger arguments. Get started with LexEase.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/new">
                  Start for Free
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card text-card-foreground">
        <p className="text-xs text-muted-foreground">&copy; 2024 LexEase. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
