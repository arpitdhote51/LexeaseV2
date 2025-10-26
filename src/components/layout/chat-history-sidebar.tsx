
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor } from "lucide-react";


export default function ChatHistorySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const handleNewAnalysis = () => {
    router.push("/new");
  };
  
  const handleNewDraft = () => {
    router.push("/draft");
  };

  const navLinks = [
    { href: "/", icon: "home", label: "Home" },
    { href: "/lexy", icon: "robot_2", label: "Lexy Chat" },
    { href: "/consult", icon: "groups", label: "Consult a Lawyer" },
    { href: "/learn", icon: "school", label: "Learn Law" },
    { href: "/about", icon: "info", label: "About Us" },
    { href: "/contact", icon: "contact_support", label: "Contact Us" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="px-6 py-5 border-b border-border flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-bold text-primary">LexEase</h1>
        </Link>
      </div>

      <div className="p-4 space-y-2">
        <Button onClick={handleNewAnalysis} className="w-full bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90">
            <span className="material-symbols-outlined mr-2">add</span>
            New Analysis
        </Button>
         <Button onClick={handleNewDraft} variant="outline" className="w-full font-semibold rounded-lg">
            <span className="material-symbols-outlined mr-2">edit_document</span>
            New Draft
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="p-4 pt-0 space-y-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium text-sm ${pathname === link.href ? 'bg-background text-primary' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}>
                  <span className="material-symbols-outlined text-base">{link.icon}</span>
                  <span>{link.label}</span>
              </Link>
            ))}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-border space-y-4">
        <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block px-2">Theme</label>
            <Select onValueChange={handleThemeChange} value={theme}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-4 w-4"/> Light</div></SelectItem>
                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-4 w-4"/> Dark</div></SelectItem>
                </SelectContent>
            </Select>
        </div>
         <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block px-2">Language</label>
            <Select defaultValue="en">
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </aside>
  );
}
