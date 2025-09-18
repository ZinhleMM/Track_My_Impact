"use client";

import { useEffect } from "react";

import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  return (
    <AuthProvider>
      <div className="antialiased">{children}</div>
    </AuthProvider>
  );
}
