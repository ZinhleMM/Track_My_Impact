"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Save,
  Calculator,
  TreePine,
  Droplets,
  Zap
} from "lucide-react";
import { useTrackMyImpactData } from "@/hooks/useTrackMyImpactData";
import { classifyWaste } from "@/lib/api";

interface WasteLoggerProps {
  onItemLogged: () => void;
  storageKey: string | null;
}

export default function WasteLogger({ onItemLogged, storageKey }: WasteLoggerProps) {
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [method, setMethod] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { warmFactors, isLoading } = useTrackMyImpactData();

  // Build materials list from WARM factors (unique warm_category)
  const materials = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    (warmFactors as any[]).forEach((wf: any) => {
      const name = wf.warm_category as string;
      if (!name) return;
      const id = name.replace(/\s+/g, "_").toLowerCase();
      if (!seen.has(id)) {
        seen.add(id);
        list.push({ id, name });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [warmFactors]);

  // Selected material display name
  const selectedName = useMemo(() => {
    return materials.find((m) => m.id === material)?.name || "";
  }, [materials, material]);

  // Available methods for selected material based on dataset rows
  const availableMethods = useMemo(() => {
    if (!selectedName) return [] as { id: string; name: string }[];
    const map: Record<string, string> = { Recycling: "recycled", Composting: "composted", Landfill: "landfilled" };
    const names: Record<string, string> = { recycled: "Recycled", composted: "Composted", landfilled: "Landfilled" };
    const set = new Set<string>();
    (warmFactors as any[])
      .filter((r: any) => r.warm_category === selectedName && typeof r.disposal_method === "string")
      .forEach((r: any) => {
        const id = map[r.disposal_method as keyof typeof map];
        if (id) set.add(id);
      });
    return Array.from(set).map((id) => ({ id, name: names[id] }));
  }, [materials, material, warmFactors]);

  // Reset method if it becomes unavailable after material change
  useEffect(() => {
    if (method && !availableMethods.find((m) => m.id === method)) {
      setMethod("");
    }
  }, [material, availableMethods]);

  // Auto-select default method: prefer Composted for Food Waste, else Recycled, else first available
  useEffect(() => {
    if (!selectedName || availableMethods.length === 0) return;
    const ids = availableMethods.map((m) => m.id);
    const isFood = /food/i.test(selectedName);
    const preferred = isFood && ids.includes("composted")
      ? "composted"
      : (ids.includes("recycled") ? "recycled" : ids[0]);
    if (!method || !ids.includes(method) || (isFood && method !== preferred)) {
      setMethod(preferred);
    }
  }, [selectedName, availableMethods]);

  // (Removed legacy static materials/methods; now data-driven)

  const computedImpact = useMemo(() => {
    const weightNum = parseFloat(weight);
    if (!material || !method || !Number.isFinite(weightNum) || weightNum <= 0) return null;
    if (!selectedName) return null;
    const methodLabel =
      method === "recycled" ? "Recycling" : method === "landfilled" ? "Landfill" : "Composting";
    const row = (warmFactors as any[]).find(
      (r) => r.warm_category === selectedName && r.disposal_method === methodLabel
    );
    if (!row) return null;
    const tons = weightNum / 1000; // kg -> metric tons
    const co2PerTon = Number(row.co2e_kg_per_ton) || 0;
    let energyPerTon = Number(row.energy_kwh_per_ton);
    const waterPerTon = Number(row.water_savings_liters_per_ton) || 0;
    if ((!Number.isFinite(energyPerTon) || energyPerTon === 0) && Number.isFinite(Number(row.energy_mmbtu_per_ton))) {
      energyPerTon = Number(row.energy_mmbtu_per_ton) * 293.071; // MMBtu -> kWh
    }
    const co2Reduction = -(co2PerTon * tons);
    const energySavings = Math.abs((energyPerTon || 0) * tons);
    const waterSavings = Math.abs(waterPerTon * tons);
    return { co2Reduction, energySavings, waterSavings };
  }, [material, method, weight, warmFactors, materials]);

  const fallbackCo2Delta = useMemo(() => {
    const weightNum = parseFloat(weight);
    if (!material || !method || !Number.isFinite(weightNum) || weightNum <= 0) return null;
    const methodLower = method.toLowerCase();
    const isBeneficial = methodLower === "recycled" || methodLower === "composted";
    const base = weightNum * 2.1; // simple heuristic for preview
    return isBeneficial ? base : -base;
  }, [material, method, weight]);

  const methodLower = method ? method.toLowerCase() : "";
  const previewCo2 = computedImpact?.co2Reduction ?? fallbackCo2Delta ?? 0;
  const previewWater = Math.abs(
    computedImpact?.waterSavings ?? (methodLower === "recycled" ? parseFloat(weight || "0") * 15.3 : 0)
  );
  const previewEnergy = Math.abs(
    computedImpact?.energySavings ?? (methodLower === "recycled" ? parseFloat(weight || "0") * 2.8 : 0)
  );
  const previewImpactLabel = previewCo2 > 0 ? "Estimated impact avoided" : "Estimated impact created";
  const previewCardClasses =
    previewCo2 > 0 ? "bg-green-50 border-green-200" : "bg-rose-50 border-rose-200";
  const previewIconClass = previewCo2 > 0 ? "text-green-600" : "text-rose-600";

  const handleSubmit = async () => {
    if (!storageKey) {
      setFormError('Please sign in to log items.');
      return;
    }
    if (material && weight && method) {
      const methodLower = String(method).toLowerCase();
      const isRecycled = methodLower === 'recycled';
      const isComposted = methodLower === 'composted';

      const fallbackImpact = {
        co2Reduction: fallbackCo2Delta ?? 0,
        waterSavings: Math.max(0, parseFloat(weight) * (isRecycled ? 15.3 : 0)),
        energySavings: Math.max(0, parseFloat(weight) * (isRecycled ? 2.8 : 0)),
      };

      const baselineImpact = computedImpact || fallbackImpact;

      const selectedName = materials.find((m) => m.id === material)?.name || material;
      const weightValue = parseFloat(weight);
      const grams = Math.round(weightValue * 1000);

      let impactValue = baselineImpact.co2Reduction;
      let waterSavings = baselineImpact.waterSavings;
      let energySavings = baselineImpact.energySavings;
      let nudgeText = isRecycled
        ? 'Great choice! Recycling keeps materials in circulation.'
        : isComposted
        ? 'Composting organics prevents methane in landfills.'
        : 'Consider recycling or composting next time to avoid landfill emissions.';

      const normalizedName = selectedName.toLowerCase();
      const impactMaterialKey = (() => {
        if (normalizedName.includes('glass')) return 'glass';
        if (normalizedName.includes('metal') || normalizedName.includes('aluminum') || normalizedName.includes('steel')) return 'metal';
        if (normalizedName.includes('paper') || normalizedName.includes('cardboard') || normalizedName.includes('magazine')) return 'paper';
        if (normalizedName.includes('organic') || normalizedName.includes('food') || normalizedName.includes('compost')) return 'organic';
        if (normalizedName.includes('textile') || normalizedName.includes('clothing') || normalizedName.includes('fabric')) return 'textiles';
        if (normalizedName.includes('polystyrene')) return 'plastic';
        if (normalizedName.includes('plastic')) return 'plastic';
        return 'metal';
      })();

      try {
        const serverResult = await classifyWaste(impactMaterialKey, methodLower, grams);
        impactValue = serverResult.impact_value;
        nudgeText = serverResult.nudge_text;
        waterSavings = baselineImpact.waterSavings;
        energySavings = baselineImpact.energySavings;
      } catch (error) {
        console.warn('Failed to persist manual log to backend, falling back to local impact', error);
      }

      const logEntry = {
        id: Date.now().toString(),
        friendlyName: selectedName,
        method,
        weightGrams: grams,
        impactValue,
        nudgeText,
        timestamp: new Date().toISOString(),
        co2Reduction: impactValue,
        waterSavings,
        energySavings,
      };

      const logs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      logs.push(logEntry);
      localStorage.setItem(storageKey, JSON.stringify(logs));

      setMaterial('');
      setWeight('');
      setMethod('');
      setFormError(null);
      onItemLogged();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Log Waste Item</h2>
        <p className="text-gray-600">
          Record your waste items with EPA WARM v15.2 impact calculations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-green-600" />
            Waste Details
          </CardTitle>
          <CardDescription>
            Enter waste details for accurate environmental impact tracking
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
                <SelectValue placeholder="How was it handled?" />
              </SelectTrigger>
              <SelectContent>
                {availableMethods.map((meth) => (
                  <SelectItem key={meth.id} value={meth.id}>
                    {meth.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(Number(weight) > 0 && method) && (
            <Card className={previewCardClasses}>
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-2">{previewImpactLabel}</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <TreePine className={`h-3 w-3 ${previewIconClass}`} />
                    <span>{Math.abs(previewCo2).toFixed(2)}kg CO₂e</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-600" />
                    <span>{previewWater.toFixed(1)}L water</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-600" />
                    <span>{previewEnergy.toFixed(1)}kWh</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!material || !weight || !method}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Log Waste Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
