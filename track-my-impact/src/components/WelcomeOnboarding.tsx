"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Recycle, Camera, BarChart3, Users } from "lucide-react";

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Track My Impact",
    description: "Personalised waste tracking that turns everyday recycling into measurable climate action.",
    icon: Recycle,
    body: (
      <p className="text-gray-600">
        Discover how each item you divert from landfill avoids CO₂ emissions, saves energy, and supports a
        circular economy. We combine AI classification with local nudges to keep you motivated.
      </p>
    ),
  },
  {
    title: "Snap, Select, Log",
    description: "AI classification suggests a material, you confirm the disposal method, and we log the impact.",
    icon: Camera,
    body: (
      <ul className="space-y-2 text-sm text-gray-600">
        <li>• Confidence alerts prompt you to double-check if the model is uncertain.</li>
        <li>• Supports recycled, composted, landfilled, and incinerated scenarios.</li>
        <li>• Every entry is tied to your account so you can continue on any device.</li>
      </ul>
    ),
  },
  {
    title: "Track Progress Together",
    description: "Compare your savings with the community and unlock new milestones as you recycle.",
    icon: Users,
    body: (
      <ul className="space-y-2 text-sm text-gray-600">
        <li>• Community leaderboard surfaces top CO₂ savers.</li>
        <li>• Personal dashboards highlight streaks, impact levels, and behavioural nudges.</li>
        <li>• Manual logging keeps edge cases and one-off items under your control.</li>
      </ul>
    ),
  },
];

export default function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const percentage = ((currentStep + 1) / steps.length) * 100;
  const { title, description, icon: Icon, body } = steps[currentStep];

  const goNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Recycle className="h-6 w-6 text-green-600" />
            Track My Impact Onboarding
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={percentage} className="h-2" />

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-start gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Icon className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <div className="md:w-2/3 text-sm leading-relaxed text-gray-600">{body}</div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={goNext}>
              {currentStep === steps.length - 1 ? "Get started" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
