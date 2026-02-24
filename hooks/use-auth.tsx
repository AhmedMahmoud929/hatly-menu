"use client";

import type React from "react";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getUserFromToken } from "@/lib/auth-utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  // Only dashboard (admin) routes require login; the rest of the site is public for customers
  const isDashboardRoute = pathname?.includes("/dashboard") ?? false;

  // Fetch user once on mount (for admin dashboard)
  useEffect(() => {
    getUserFromToken()
      .then((user) => {
        if (user) setUser(user);
      })
      .finally(() => setLoading(false));
  }, []);

  // Redirect to login only when on a dashboard route and not authenticated
  useEffect(() => {
    if (!loading && !user && isDashboardRoute) {
      router.push("/login");
    }
  }, [loading, user, isDashboardRoute, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Success",
        description: "Registered successfully. Please log in.",
        variant: "success",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      toast({
        title: "Success",
        description: "Logged out successfully",
        variant: "success",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {" "}
      {children}{" "}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
