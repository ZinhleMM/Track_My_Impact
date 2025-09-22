/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

LayoutShell.tsx: Consistent navigation frame for secondary pages and tools.
*/
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

const primaryNav = [
  { href: "/", label: "Dashboard" },
  { href: "/calculator", label: "Calculator" },
  { href: "/about", label: "About" },
];

/**
 * Shared layout with sticky navigation used by secondary routes.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="sticky top-0 z-40 border-b border-green-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-green-600 p-2">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Track My Impact</p>
              <p className="text-xs text-gray-500">Waste Classification & Impact Tracking</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {primaryNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  size="lg"
                  className={`rounded-full border-2 px-5 py-1 text-sm font-semibold transition-all ${
                    active
                      ? "border-green-600 bg-green-600 text-white shadow"
                      : "border-green-300 bg-white text-green-700 hover:bg-green-100"
                  }`}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
