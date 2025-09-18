"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getModelStatus, isModelAvailable, classifyWaste, loadLabels } from "@/utils/model-loader";
import { useTrackMyImpactData, findDomesticMaterial } from "@/hooks/useTrackMyImpactData";

export default function ModelCheckPage() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<any>(null);
  const [available, setAvailable] = useState<boolean>(false);
  const [preds, setPreds] = useState<any[]>([]);
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { domesticMaterials } = useTrackMyImpactData();

  useEffect(() => {
    (async () => {
      try {
        const avail = await isModelAvailable();
        setAvailable(avail);
        const s = getModelStatus();
        setStatus(s);
        const lbs = await loadLabels();
        setLabels(lbs);
        setStatus(getModelStatus());
      } catch (e: any) {
        setError(e?.message || "Failed to inspect model");
      }
    })();
  }, []);

  useEffect(() => {
    if (!labels.length) return;
    const missing: string[] = [];
    for (const l of labels) {
      const m = findDomesticMaterial(l, domesticMaterials);
      if (!m) missing.push(l);
    }
    setUnmapped(missing.slice(0, 20));
  }, [labels, domesticMaterials]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      if (imgRef.current) imgRef.current.src = url;
      try {
        const res = await classifyWaste(img);
        setPreds(res);
      } catch (err: any) {
        setError(err?.message || "Prediction failed");
      }
    };
    img.onerror = () => setError("Could not load image");
    img.src = url;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Self-Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={available ? "default" : "secondary"}>
              {available ? "Model Found" : "Model Missing"}
            </Badge>
            {status && (
              <>
                <span>Expected classes: {status.expectedClasses}</span>
                <span>Actual labels: {status.actualClasses}</span>
                <span>Input: {status.inputSize}x{status.inputSize}</span>
                <span>Norm: {status.normalization}</span>
              </>
            )}
          </div>

          <div className="text-sm text-gray-700">
            Mapping coverage: {labels.length - unmapped.length}/{labels.length} mapped
            {unmapped.length > 0 && (
              <div className="mt-2">
                Unmapped sample ({unmapped.length > 20 ? "first 20" : unmapped.length} shown):
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                  {unmapped.map((u) => (
                    <code key={u} className="text-xs bg-gray-100 px-2 py-1 rounded">{u}</code>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Input type="file" accept="image/*" onChange={onFile} />
            <img ref={imgRef} alt="preview" className="max-h-64 rounded border" />
          </div>

          {preds.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold">Top predictions</div>
              <div className="space-y-1 text-sm">
                {preds.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="truncate">
                      <span className="font-mono">{p.className}</span>
                      <span className="text-gray-600 ml-2">({(p.confidence*100).toFixed(2)}%)</span>
                    </div>
                    <div className="text-xs text-gray-500">WARM: {p.warmCategory}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use Your Keras Model</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>1) Convert to TFJS:</div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs">
pip install tensorflowjs
tensorflowjs_converter --input_format=keras waste_model.keras public/model
          </pre>
          <div>2) Place labels file at <code>/labels.json</code> (array of class names in training order).</div>
          <div>3) Adjust normalization if needed via env:</div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs">
NEXT_PUBLIC_TMI_TFJS_NORM=-1_1
NEXT_PUBLIC_TMI_TFJS_INPUT=224
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
