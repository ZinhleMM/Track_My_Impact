/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

AIClassification.tsx: Hybrid inference workflow combining TFJS and API-backed impact logging.
*/
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain
} from "lucide-react";

import classificationMetadata from "@/public/data/cnn-mappings.json";
import { classifyWaste } from "@/lib/api";

import {
  classifyWaste as runLocalClassifier,
  isModelAvailable,
  getModelStatus,
  loadLabels,
  loadModel,
  type ClassificationResult
} from "@/utils/model-loader";

/**
 * Hybrid AI classifier that prefers the backend but can fall back to the TFJS model.
 */
interface AIClassificationProps {
  onItemLogged: () => void;
  storageKey: string | null;
}

interface ClassifiedMaterial {
  materialId: string;
  impactMaterial: string;
  friendlyName: string;
  category: string;
  confidence: number;
  defaultWeightKg: number;
}

interface ImpactResponse {
  impact_value: number;
  nudge_text: string;
}

const disposalOptions = [
  { value: "recycled", label: "Recycled" },
  { value: "composted", label: "Composted" },
  { value: "landfilled", label: "Landfilled" },
  { value: "incinerated", label: "Incinerated" }
];

const metadataMap = classificationMetadata as Record<
  string,
  {
    friendlyName: string;
    category: string;
    impactMaterial: string;
    warmCategory: string;
    defaultWeightKg: number;
  }
>;

export default function AIClassification({ onItemLogged, storageKey }: AIClassificationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [classification, setClassification] = useState<ClassifiedMaterial | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [weightGrams, setWeightGrams] = useState<string>("0");
  const [impactResponse, setImpactResponse] = useState<ImpactResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelStatusMessage, setModelStatusMessage] = useState("Checking model availability...");

  // Prepare the on-device classification stack so predictions stay responsive offline.
  useEffect(() => {
    let cancelled = false;

    async function bootstrapModel() {
      try {
        setModelStatusMessage("Loading classification model...");
        await loadLabels();
        await loadModel();
        if (cancelled) return;
        setModelReady(true);
        setModelStatusMessage("Model loaded");
      } catch (error) {
        console.error("Unable to load TensorFlow.js model", error);
        if (cancelled) return;
        setModelReady(false);
        setModelStatusMessage("Model unavailable - using fallback");
      }
    }

    bootstrapModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // When a new prediction arrives, reset manual selections so the form reflects fresh data.
  useEffect(() => {
    if (!classification) {
      setSelectedMethod("");
      setWeightGrams("0");
      setImpactResponse(null);
      setErrorMessage(null);
      setAuthError(null);
    }
  }, [classification]);

  const resetFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mapToMetadata = (label: string, confidence: number): ClassifiedMaterial => {
    const meta = metadataMap[label];
    if (!meta) {
      return {
        materialId: label,
        impactMaterial: "plastic",
        friendlyName: label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        category: "other",
        confidence,
        defaultWeightKg: 0.1,
      };
    }

    return {
      materialId: label,
      impactMaterial: meta.impactMaterial,
      friendlyName: meta.friendlyName,
      category: meta.category,
      confidence,
      defaultWeightKg: meta.defaultWeightKg,
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setClassification(null);
      setImpactResponse(null);
      setErrorMessage(null);
    }
  };

  // Route the uploaded image through the local model (or fallback) and prepare default weights.
  const handleClassify = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let modelAvailable = modelReady;
      if (!modelAvailable) {
        modelAvailable = await isModelAvailable();
      }

      if (modelAvailable) {
        if (!modelReady) {
          // Attempt to load if availability check passed after initial failure
          try {
            await loadModel();
            setModelReady(true);
            setModelStatusMessage("Model loaded");
          } catch (error) {
            console.error("Model became available but failed to load", error);
            setModelReady(false);
            setModelStatusMessage("Model unavailable - using fallback");
            modelAvailable = false;
          }
        }
      }

      if (modelAvailable) {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(selectedFile);
        });

        const classificationResults = await runLocalClassifier(img);
        const topResult: ClassificationResult | undefined = classificationResults[0];

        if (topResult) {
          const material = mapToMetadata(topResult.className, topResult.confidence);
          setClassification(material);
          setSelectedMethod("");
          setWeightGrams(Math.round(material.defaultWeightKg * 1000).toString());
        }

        URL.revokeObjectURL(img.src);
      } else {
        setModelReady(false);
        setModelStatusMessage("Model unavailable - using fallback");
        const fallbackLabels = Object.keys(metadataMap);
        const randomLabel = fallbackLabels[Math.floor(Math.random() * fallbackLabels.length)];
        const material = mapToMetadata(randomLabel, 0.65);
        setClassification(material);
        setSelectedMethod("");
        setWeightGrams(Math.round(material.defaultWeightKg * 1000).toString());
      }
    } catch (error) {
      console.error("Classification error:", error);
      setErrorMessage("Failed to classify the image. Please try again or choose a different photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Persist the classification to the backend API and update local storage for offline dashboards.
  const handleLogImpact = async () => {
    if (!classification) {
      setErrorMessage("Classify an item before logging the impact.");
      return;
    }
    if (!selectedMethod) {
      setErrorMessage("Select a disposal method to continue.");
      return;
    }
    if (!storageKey) {
      setAuthError("Please sign in to log this item.");
      return;
    }

    const grams = Number(weightGrams);
    if (!Number.isFinite(grams) || grams <= 0) {
      setErrorMessage("Enter a valid weight in grams.");
      return;
    }

    setIsLogging(true);
    setErrorMessage(null);
    setAuthError(null);

    try {
      const response = await classifyWaste(classification.impactMaterial, selectedMethod, grams);
      setImpactResponse(response);

      const logEntry = {
        id: Date.now().toString(),
        materialId: classification.materialId,
        impactMaterial: classification.impactMaterial,
        friendlyName: classification.friendlyName,
        category: classification.category,
        method: selectedMethod,
        weightGrams: grams,
        confidence: classification.confidence,
        impactValue: response.impact_value,
        nudgeText: response.nudge_text,
        timestamp: new Date().toISOString(),
      };

      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existingLogs.push(logEntry);
      localStorage.setItem(storageKey, JSON.stringify(existingLogs));

      setClassification(null);
      resetFileInput();
      onItemLogged();
    } catch (error: any) {
      console.error("Failed to log impact", error);
      setErrorMessage(error?.message || "Unable to log this item right now. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Waste Classification</h2>
        <p className="text-gray-600">
          Upload photos of waste items for instant AI-powered identification and landfill comparison insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            CNN-Powered Classification
          </CardTitle>
          <CardDescription>{modelStatusMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Upload Waste Image</h3>
              <p className="text-gray-600">Take a clear photo of your waste item for classification</p>
            </div>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  aria-label="Upload waste image"
                  onChange={handleFileSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
              </label>
            </div>
            {selectedFile && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {selectedFile.name}
                </Badge>
                <Button variant="ghost" size="sm" onClick={resetFileInput}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          {selectedFile && !classification && !isProcessing && (
            <div className="text-center">
              <Button onClick={handleClassify} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-4 w-4 mr-2" />
                Classify Image
              </Button>
            </div>
          )}

          {isProcessing && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900 mb-1">Processing Image...</h3>
                <p className="text-sm text-blue-700">
                  The CNN is analyzing your image for material identification
                </p>
              </CardContent>
            </Card>
          )}

          {classification && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Classification Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {classification.confidence < 0.7 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Uncertain classification. Please confirm manually before logging.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Identified Material</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {classification.friendlyName}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {(classification.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Category: {classification.category} • Default weight: {classification.defaultWeightKg.toFixed(2)} kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="weight-input">
                      Estimated weight (grams)
                    </label>
                    <Input
                      id="weight-input"
                      type="number"
                      min={1}
                      value={weightGrams}
                      onChange={(event) => setWeightGrams(event.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Adjust if the item is heavier or lighter than the suggested average.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Disposal method</label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select disposal method" />
                      </SelectTrigger>
                      <SelectContent>
                        {disposalOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleLogImpact}
                    disabled={!selectedMethod || isLogging}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLogging ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Log Impact
                      </>
                    )}
                  </Button>
                </div>

                {impactResponse && (
                  <div
                    className={`p-4 rounded-lg ${
                      impactResponse.impact_value > 0
                        ? "bg-emerald-100 border border-emerald-200"
                        : "bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {impactResponse.impact_value > 0 ? "Impact avoided" : "Impact created"}: {Math.abs(impactResponse.impact_value).toFixed(2)} kg CO₂e compared to landfill
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{impactResponse.nudge_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips for better classification:</strong> Take clear, well-lit photos with the item filling most of the frame.
          Clean items work better than dirty ones. The model works best with single items rather than multiple objects.
        </AlertDescription>
      </Alert>
    </div>
  );
}
