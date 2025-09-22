/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

calculator/page.tsx: Environmental impact calculator page for standalone access.
*/
"use client";

import LayoutShell from "@/components/LayoutShell";
import EnvironmentalCalculator from "@/components/EnvironmentalCalculator";

/**
 * Standalone route for the calculator for use in isolation.
 */
export default function CalculatorPage() {
  return (
    <LayoutShell>
      <div className="space-y-6">
        <EnvironmentalCalculator />
      </div>
    </LayoutShell>
  );
}
