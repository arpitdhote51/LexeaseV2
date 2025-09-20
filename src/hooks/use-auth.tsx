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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  // In guest-only mode, the user is always null and loading is always false.
  const value = {
    user: null,
    loading: false,
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
