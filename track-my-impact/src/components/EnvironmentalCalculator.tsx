/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

EnvironmentalCalculator.tsx: Offline-first calculator mirroring backend WARM factor computations.
*/
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  TreePine,
  Droplets,
  Zap,
  Car,
  Smartphone,
  Lightbulb,
  Info,
  TrendingUp,
  Home
} from "lucide-react";
import { useTrackMyImpactData } from "@/hooks/useTrackMyImpactData";

// Helper that translates raw equivalency records into UX-friendly stats displayed below
function computeEquivalenciesFromFactors(
  equivalencyFactors: any[],
  co2Kg: number,
  kwh: number,
  liters: number
) {
  // Build an index by equivalency_id for quick lookup
  const byId: Record<string, any> = {};
  for (const f of equivalencyFactors as any[]) {
    if (f && f.equivalency_id) byId[f.equivalency_id] = f;
  }

  // We will compute three displays tied to uploaded factors:
  // cars_off_road: unit_from kg_co2e -> unit_to car_days; convert kg CO2e to car-days
  // homes_powered: unit_from kwh -> unit_to home_hours; convert kWh to home-hours
  // trees_planted: unit_from kg_co2e -> unit_to trees; convert kg CO2e to trees

  const carDays =
    byId["cars_off_road"]?.conversion_rate && byId["cars_off_road"]?.unit_from === "kg_co2e"
      ? co2Kg / byId["cars_off_road"].conversion_rate
      : 0;

  const homeHours =
    byId["homes_powered"]?.conversion_rate && byId["homes_powered"]?.unit_from === "kwh"
      ? kwh / byId["homes_powered"].conversion_rate
      : 0;

  const trees =
    byId["trees_planted"]?.conversion_rate && byId["trees_planted"]?.unit_from === "kg_co2e"
      ? co2Kg / byId["trees_planted"].conversion_rate
      : 0;

  return { carDays, homeHours, trees };
}

/**
 * Calculator that mirrors the backend impact endpoint but works offline with JSON data.
 */
/**
 * Calculator that mirrors the backend impact endpoint but works offline with JSON data.
 */
export default function EnvironmentalCalculator() {
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [method, setMethod] = useState("");
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { warmFactors, equivalencyFactors, isLoading, error } = useTrackMyImpactData();

  // Build materials list from warmFactors using `warm_category`
  const materials = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string; category: string }[] = [];
    warmFactors.forEach((wf: any) => {
      const name = wf.warm_category as string;
      if (!name) return;
      const id = name.replace(/\s+/g, "_").toLowerCase();
      if (!seen.has(id)) {
        seen.add(id);
        list.push({ id, name, category: name });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [warmFactors]);

  const methods = [
    { id: "recycled", name: "Recycled" },
    { id: "composted", name: "Composted" },
    { id: "landfilled", name: "Landfilled" }
  ];

  // Run the lightweight client-side WARM calculation using local JSON data
  const calculateImpact = async () => {
    if (!material || !weight || !method) return;
    const weightNum = parseFloat(weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) return;

    const selectedName = materials.find((m) => m.id === material)?.name ?? material;
    const methodLabel =
      method === "recycled"
        ? "Recycling"
        : method === "landfilled"
        ? "Landfill"
        : "Composting";

    setSubmitting(true);
    try {
      const row = (warmFactors as any[]).find(
        (r) =>
          r.warm_category?.toLowerCase() === selectedName.toLowerCase() &&
          r.disposal_method === methodLabel
      );
      if (!row) {
        setResults(null);
        return;
      }

      const tons = weightNum / 1000;
      const co2PerTon = Number(row.co2e_kg_per_ton) || 0;
      let energyPerTon = Number(row.energy_kwh_per_ton);
      const waterPerTon = Number(row.water_savings_liters_per_ton) || 0;
      if ((!Number.isFinite(energyPerTon) || energyPerTon === 0) && Number.isFinite(Number(row.energy_mmbtu_per_ton))) {
        energyPerTon = Number(row.energy_mmbtu_per_ton) * 293.071;
      }
      const co2Saved = Math.abs(co2PerTon * tons);
      const energySaved = Math.abs((energyPerTon || 0) * tons);
      const waterSaved = Math.abs(waterPerTon * tons);
      const eqDisplay = computeEquivalenciesFromFactors(
        equivalencyFactors as any[],
        co2Saved,
        energySaved,
        waterSaved
      );
      setResults({ co2Saved, energySaved, waterSaved, equivalencies: eqDisplay });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Environmental Impact Calculator</h2>
        <p className="text-gray-600">
          Calculate the environmental benefits of your waste management choices using EPA WARM v15.2 data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Impact Calculator
            </CardTitle>
            <CardDescription>
              Enter waste details to see environmental impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Material Type
              </label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading materials..." : "Select material type"} />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat.id} value={mat.id}>
                      {mat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Weight (kg)
              </label>
              <Input
                type="number"
                placeholder="Enter weight in kilograms"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Management Method
              </label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="How will it be handled?" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((meth) => (
                    <SelectItem key={meth.id} value={meth.id}>
                      {meth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateImpact}
              disabled={isLoading || !material || !weight || !method || submitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {submitting ? 'Calculating…' : 'Calculate Impact'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Environmental Impact
            </CardTitle>
            <CardDescription>
              Based on EPA WARM v15.2 life cycle assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 mb-4">{error}</div>
            )}
            {results ? (
              <div className="space-y-6">
                {/* Core Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TreePine className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-800">
                      {results.co2Saved.toFixed(2)}
                    </div>
                    <div className="text-xs text-green-600">kg CO₂ saved</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-800">
                      {results.waterSaved.toFixed(0)}
                    </div>
                    <div className="text-xs text-blue-600">L water saved</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-800">
                      {results.energySaved.toFixed(1)}
                    </div>
                    <div className="text-xs text-purple-600">kWh saved</div>
                  </div>
                </div>

                <Separator />

                {/* User-Friendly Equivalencies */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">What This Means:</h4>
                  <div className="space-y-2">
                    {results.equivalencies.carDays > 0.01 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-gray-600" />
                        <span>
                          Equivalent to taking a car off the road for{" "}
                          {results.equivalencies.carDays.toFixed(1)} days
                        </span>
                      </div>
                    )}
                    {results.equivalencies.homeHours > 0.01 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-gray-600" />
                        <span>
                          Enough energy to power a home for{" "}
                          {results.equivalencies.homeHours.toFixed(1)} hours
                        </span>
                      </div>
                    )}
                    {results.equivalencies.trees > 0.01 && (
                      <div className="flex items-center gap-2 text-sm">
                        <TreePine className="h-4 w-4 text-gray-600" />
                        <span>
                          Same as planting {results.equivalencies.trees.toFixed(1)} trees
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Data Source</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Calculations based on EPA WARM Model v15.2 life cycle assessment factors
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Enter material details to calculate environmental impact</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Educational Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" />
            Understanding Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <TreePine className="h-4 w-4 text-green-600" />
                Carbon Footprint
              </h4>
              <p className="text-sm text-gray-600">
                CO₂ savings represent avoided greenhouse gas emissions through proper waste management.
                Recycling typically saves more carbon than landfilling.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Energy Efficiency
              </h4>
              <p className="text-sm text-gray-600">
                Energy savings come from using recycled materials instead of virgin resources.
                Manufacturing from recycled materials typically requires less energy.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                Water Conservation
              </h4>
              <p className="text-sm text-gray-600">
                Water savings reflect the reduced water usage in recycled material production
                compared to virgin material production processes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WARM Model Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">About EPA WARM v15.2</h4>
          <p className="text-sm text-blue-800">
            The Waste Reduction Model (WARM) is a scientifically peer-reviewed life cycle assessment tool
            developed by the US Environmental Protection Agency. It provides accurate environmental impact
            factors for various waste management practices based on comprehensive research and data analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
