"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadLabels } from "@/utils/model-loader";
import { useTrackMyImpactData, findDomesticMaterial } from "@/hooks/useTrackMyImpactData";

type CoverageRow = {
  label: string;
  warmCategory: string;
  methods: string[]; // Friendly: Recycled | Landfilled | Composted | other
};

function normalizeMethodFriendly(value: string): string {
  const v = (value || "").toLowerCase();
  if (v.startsWith("recycl")) return "Recycled";
  if (v.startsWith("compost")) return "Composted";
  if (v.startsWith("landfill")) return "Landfilled";
  return value;
}

export default function MappingCheckPage() {
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { domesticMaterials, warmFactors } = useTrackMyImpactData();

  useEffect(() => {
    (async () => {
      try {
        const lbs = await loadLabels();
        setLabels(lbs);
      } catch (e: any) {
        setError(e?.message || "Failed to load labels.json");
      }
    })();
  }, []);

  const coverage = useMemo<CoverageRow[]>(() => {
    if (!labels.length) return [];
    const rows: CoverageRow[] = [];
    for (const l of labels) {
      const dm = findDomesticMaterial(l, domesticMaterials);
      const warm = dm?.warm_category || "";
      const methods = new Set<string>();
      for (const wf of warmFactors as any[]) {
        if (!wf?.warm_category) continue;
        if ((wf.warm_category as string).toLowerCase() !== (warm || "").toLowerCase()) continue;
        methods.add(normalizeMethodFriendly(wf.disposal_method || wf.method || ""));
      }
      rows.push({ label: l, warmCategory: warm || "(unmapped)", methods: Array.from(methods) });
    }
    return rows;
  }, [labels, domesticMaterials, warmFactors]);

  const unmapped = coverage.filter(r => !r.warmCategory || r.warmCategory === "(unmapped)" || r.methods.length === 0);
  const compostWantedMissing = coverage.filter(r => r.warmCategory.toLowerCase().includes("food") && !r.methods.includes("Composted"));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WARM Mapping Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Labels: {labels.length}</Badge>
            <Badge variant={unmapped.length ? "secondary" : "default"}>Unmapped/No Methods: {unmapped.length}</Badge>
            <Badge variant={compostWantedMissing.length ? "secondary" : "default"}>Food without Composted: {compostWantedMissing.length}</Badge>
          </div>

          {unmapped.length > 0 && (
            <div className="mt-3">
              <div className="font-medium mb-1">First 20 unmapped/no-method labels</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {unmapped.slice(0, 20).map((r) => (
                  <div key={r.label} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <code className="text-xs">{r.label}</code>
                    <span className="text-xs text-gray-600">({r.warmCategory})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="font-medium mb-1">Sample coverage</div>
            <div className="space-y-1">
              {coverage.slice(0, 25).map((r) => (
                <div key={r.label} className="flex items-center justify-between border rounded p-2">
                  <div className="truncate">
                    <code className="text-xs">{r.label}</code>
                    <span className="text-xs text-gray-600 ml-2">→ {r.warmCategory || '(unmapped)'}</span>
                  </div>
                  <div className="flex gap-1">
                    {r.methods.length ? r.methods.map(m => <Badge key={m} variant="outline">{m}</Badge>) : <Badge variant="secondary">No Methods</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

