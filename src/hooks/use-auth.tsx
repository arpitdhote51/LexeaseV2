"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";

// Define a simplified AuthContextType for a guest-only experience.
interface AuthContextType {
  user: User | null; // Always null for guest mode
  loading: boolean; // Always false as we are not performing an async auth check
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A "no-op" function that does nothing, to be used for auth functions.
const noOpPromise = () => Promise.resolve();
const noOpPromiseWithMessage = () => {
    console.warn("Authentication is disabled in this application version.");
    return Promise.resolve();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  
  // In guest-only mode, the user is always null and loading is always false.
  const value = {
    user: null,
    loading: false,
    signIn: noOpPromiseWithMessage,
    signUp: noOpPromiseWithMessage,
    signOut: noOpPromise,
    sendPasswordReset: noOpPromiseWithMessage,
    resendVerificationEmail: noOpPromiseWithMessage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
