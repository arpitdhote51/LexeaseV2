
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Bot, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { interactiveQA, InteractiveQAInput } from "@/ai/flows/interactive-qa";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

interface QAChatProps {
  documentText: string;
  documentId: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: any;
}

export default function QAChat({ documentText, documentId }: QAChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          setTimeout(() => {
              viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
          }, 100);
        }
    }
  }, []);

  useEffect(() => {
    if (!documentId || documentId === 'temp-id' || !db) return;

    const messagesCol = collection(db, "documents", documentId, "messages");
    const q = query(messagesCol, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history: Message[] = [];
       querySnapshot.forEach((doc) => {
         history.push({ id: doc.id, ...doc.data() } as Message);
       });
      setMessages(history);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching chat history: ", error);
      // Firestore throws 'failed-precondition' if indexes are being built.
      // This is a transient state in development, so we can inform the user.
      if (error.code === 'failed-precondition') {
          toast({
              variant: "destructive",
              title: "Database Indexing",
              description: "The database is being set up. Chat history may not be available yet. Please wait a moment."
          });
      } else {
           toast({
              variant: "destructive",
              title: "Error",
              description: "Could not load chat history."
          });
      }
    });

    return () => unsubscribe();
  }, [documentId, scrollToBottom, toast]);


  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startRecognition = () => {
    if (typeof window === 'undefined') return;
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({ variant: 'destructive', title: 'Speech recognition not supported' });
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecognizing(true);
    recognition.onend = () => {
        setIsRecognizing(false);
        recognitionRef.current = null;
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({ variant: 'destructive', title: 'Speech Recognition Error' });
    };

    let finalTranscript = '';
    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setInput(finalTranscript + interimTranscript);
        if(finalTranscript){
            setInput(finalTranscript);
        }
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const currentInput = input;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = { 
        role: "user", 
        content: currentInput, 
        timestamp: serverTimestamp() 
    };

    // Optimistically update the UI
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Save user message to Firestore if not a temp document
    if (documentId !== 'temp-id' && db) {
        try {
            await addDoc(collection(db, "documents", documentId, "messages"), userMessage);
        } catch (error) {
             console.error("Error saving user message:", error);
             toast({
                variant: "destructive",
                title: "Message Error",
                description: "Could not save your message."
             });
             // Optionally, revert the optimistic update
             setMessages(prev => prev.slice(0, -1));
             return; // Stop if message can't be saved
        }
    }
    
    setIsLoading(true);

    try {
        const qaInput: InteractiveQAInput = { documentText, question: currentInput };
        const result = await interactiveQA(qaInput);
        const assistantMessage: Message = { 
            role: "assistant", 
            content: result.answer,
            timestamp: serverTimestamp()
        };

        // Optimistically update UI for assistant message
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to Firestore
        if (documentId !== 'temp-id' && db) {
            await addDoc(collection(db, "documents", documentId, "messages"), assistantMessage);
        }

    } catch (error) {
        console.error("Q&A failed:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not get an answer. Please try again." });
        setMessages(prev => prev.slice(0, -1)); // Revert only the assistant's failed response
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="h-[70vh] flex flex-col mt-4 bg-white border-border shadow-none">
      <CardHeader>
        <CardTitle className="font-bold text-lg text-foreground">Interactive Q&amp;A</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-10">
                    <p>Ask a question about your document to get started.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={message.id || `msg-${index}`}
                className={`flex items-start gap-3 animate-fade-in-up ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-lg text-sm relative group shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-body leading-relaxed">{message.content}</p>
                </div>
                 {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-muted">
                    <AvatarFallback><User size={20} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 animate-fade-in-up">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 max-w-sm bg-background flex items-center space-x-2">
                        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse"></span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                name="q"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about the document..."
                disabled={isLoading || !documentText}
                className="text-base"
              />
              <Button type="button" variant={isRecognizing ? "destructive" : "outline"} size="icon" onClick={startRecognition} disabled={isLoading}>
                  <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
        </div>
      </CardContent>
    </Card>
  );
}
