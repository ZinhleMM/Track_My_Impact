/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

DataVisualizations.tsx: Interactive analytics surface that contextualises personal waste logs with regional datasets.
*/
// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
const Plot = dynamic(async () => {
  const [{ default: createPlotlyComponent }, plotly] = await Promise.all([
    import("react-plotly.js/factory"),
    import("plotly.js-dist-min"),
  ]);
  return createPlotlyComponent(plotly as any);
}, {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center text-sm text-gray-500">Loading chart...</div>,
});

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

      {/* Motivation Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-yellow-600" />
            Why Your Actions Matter
          </CardTitle>
          <CardDescription>
            South Africa faces a landfill crisis and urgent waste diversion targets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            Nationally, South Africa generates around <strong>107 million tonnes of general waste</strong> 
            every year, with about <strong>90% still ending up in landfills or stockpiles</strong>.
          </p>
          <p>
            The Department of Forestry, Fisheries and Environment has set an ambitious goal to 
            <strong> divert 40% of waste within five years</strong>. For this to succeed, 
            households must sort, clean, and separate waste correctly.
          </p>
          <p className="font-semibold text-green-800">
            Track My Impact helps you classify your waste, see its environmental consequences, 
            and feed more materials back into recycling streams, keeping them out of landfills.
          </p>
        </CardContent>
      </Card>

      {/* Diversion Target Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            South Africa Waste Diversion Target
          </CardTitle>
          <CardDescription>
            Current diversion progress vs the national 40% target (DFFE 2023; BusinessTech).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                type: "bar",
                x: ["Current Diversion", "National Target"],
                y: [10, 40],
                marker: { color: ["#EF553B", "#2ca02c"] },
                text: ["~10% achieved", "40% goal"],
                textposition: "auto",
              },
            ]}
            layout={{
              title: "Waste Diversion Progress (South Africa)",
              yaxis: { title: "Percentage (%)", range: [0, 50] },
            }}
            style={{ width: "100%", height: "400px" }}
          />
          <p className="text-sm text-gray-600 mt-2">
            South Africa currently diverts only about <strong>10%</strong> of its waste from landfills. 
            The national goal is <strong>40%</strong> within five years. Every household that sorts and recycles 
            contributes directly to closing this gap.
          </p>
        </CardContent>
      </Card>

      {/* Existing SA vs Global + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SA vs Global */}
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

        {/* SA Waste Trends */}
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

      {/* Johannesburg Waste Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Johannesburg Waste Flow (2023/24)
          </CardTitle>
          <CardDescription>
            Sankey diagram showing waste flows from households to landfill, compost, and recycling in Johannesburg for 2023/24. <br />
            Data: City of Johannesburg 2024; Pikitup Annual Report 2023. MLA 8.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                type: "sankey",
                orientation: "h",
                node: {
                  pad: 15,
                  thickness: 20,
                  line: { color: "black", width: 0.5 },
                  label: ["Households", "Pikitup", "Landfill", "Compost", "Recyclables"],
                  color: ["#636EFA", "#00CC96", "#EF553B", "#AB63FA", "#FFA15A"],
                },
                link: {
                  source: [0, 1, 1],
                  target: [1, 2, 3],
                  value: [1480000, 1400000, 76091],
                },
              },
            ]}
            layout={{ title: "Flow of Waste in Johannesburg (2023/24)", font: { size: 12 } }}
            style={{ width: "100%", height: "400px" }}
          />
        </CardContent>
      </Card>

      {/* NEW: Household-Level Impact Visualisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Average Household Impact (per Year)
          </CardTitle>
          <CardDescription>
            Translating city-wide diversion data into meaningful household-level benefits (2023/24).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Plot
            data={[
              {
                type: "bar",
                x: ["CO₂e Avoided", "Water Saved", "Landfill Space Saved"],
                y: [50, 500, 0.3], // Example household equivalents
                marker: { color: ["#2ca02c", "#1f77b4", "#ff7f0e"] },
                text: ["= 2 trees planted", "= 7 showers", "= 3 shopping bags"],
                textposition: "auto",
              },
            ]}
            layout={{
              title: "Average Household Contribution to Diversion (2023/24)",
              yaxis: { title: "Per Household Equivalent" },
            }}
            style={{ width: "100%", height: "400px" }}
          />
          <p className="text-sm text-gray-600 mt-2">
            By recycling consistently, each household in Johannesburg could avoid around 
            <strong> 50 kg of CO₂e emissions</strong>, save <strong>500 litres of water</strong>, 
            and free up <strong>0.3 m³ of landfill space</strong> every year. 
            Small actions add up to national impact.
          </p>
        </CardContent>
      </Card>

      {/* Behavioural Nudge */}
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
              <p className="text-xs mt-2 text-gray-600">
                Every item you recycle helps move Johannesburg closer to the national goal of diverting 40% of waste from landfills.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Log an item to see personalised nudges here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}