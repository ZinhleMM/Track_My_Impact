"use client";

import EnvironmentalCalculator from "@/components/EnvironmentalCalculator";

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Environmental Impact Calculator</h1>
          <p className="text-gray-600">
            Compare disposal scenarios and understand how each choice changes your emissions footprint.
          </p>
        </header>
        <EnvironmentalCalculator />
      </div>
  );
}
