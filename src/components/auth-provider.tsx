
"use client";

import React, { useContext, useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, app } from "@/lib/firebase"; // Import app as well
import { Loader2 } from "lucide-react";
import { getApps, initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  userLoggedIn: boolean;
  loading: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure Firebase is initialized
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser({ ...user });

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      const isGoogle = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );
      setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
      setIsGoogleUser(false);
    }
    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Loading Session...</p>
          </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
