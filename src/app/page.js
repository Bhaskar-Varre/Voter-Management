'use client';

import { useAuth } from "@/app/contexts/AuthContext";
import Dashboard from "@/app/dashboard/page";
import Login from "@/app/components/Login";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>;
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
}
