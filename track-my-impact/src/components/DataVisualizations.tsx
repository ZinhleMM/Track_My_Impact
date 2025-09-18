"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BarChart3, TrendingUp, Globe } from "lucide-react";

import { getImpactRecent } from "@/lib/api";

type RecentImpact = Awaited<ReturnType<typeof getImpactRecent>>[number];

export default function DataVisualizations() {
  const [latestImpact, setLatestImpact] = useState<RecentImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const records = await getImpactRecent(1);
        setLatestImpact(records[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load impact data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const nudgeCardClass = latestImpact && latestImpact.impact_value < 0
    ? "border-rose-200 bg-rose-100 text-rose-900"
    : "border-emerald-200 bg-emerald-100 text-emerald-900";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Insights & Trends</h2>
        <p className="text-gray-600">
          Explore South African waste trends and global environmental impact data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              South Africa vs Global Average
            </CardTitle>
            <CardDescription>How SA compares to international waste management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Daily waste generation</span>
                  <span>0.89 kg vs 0.74 kg global</span>
                </div>
                <Progress value={89} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">20% above global average</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Recycling rate</span>
                  <span>34.8% vs 17.4% global</span>
                </div>
                <Progress value={70} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">Double the global average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              SA Waste Trends (2020-2023)
            </CardTitle>
            <CardDescription>Recent improvements in waste management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recycling Rate Growth</span>
                <Badge className="bg-green-100 text-green-800">+2.1%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CO₂ Emissions Reduction</span>
                <Badge className="bg-blue-100 text-blue-800">-4.8%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Latest Behavioural Nudge
          </CardTitle>
          <CardDescription>Actionable guidance from your most recent log</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-emerald-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading personalised insight...
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : latestImpact ? (
            <div className={`rounded-lg border p-4 ${nudgeCardClass}`}>
              <p className="text-sm font-semibold">
                {latestImpact.impact_value >= 0
                  ? `You avoided ${latestImpact.impact_value.toFixed(2)} kg CO₂e compared to landfill.`
                  : `This choice added ${Math.abs(latestImpact.impact_value).toFixed(2)} kg CO₂e compared to landfill.`}
              </p>
              <p className="text-sm mt-2">{latestImpact.nudge_text}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Log an item to see personalised nudges here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
