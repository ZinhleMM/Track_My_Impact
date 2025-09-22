/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

ClientBody.tsx: Client wrapper supplying global providers such as auth to every route.
*/
"use client";

import { useEffect } from "react";

import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Wraps every page with the auth provider so server layouts stay lean.
 */
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
