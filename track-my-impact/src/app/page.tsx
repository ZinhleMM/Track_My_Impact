"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  BarChart3,
  Recycle,
  BookOpen,
  Target,
  Globe,
  Home,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WelcomeOnboarding from "@/components/WelcomeOnboarding";
import MainDashboard from "@/components/MainDashboard";
import AIClassification from "@/components/AIClassification";
import WasteLogger from "@/components/WasteLogger";
import DataVisualizations from "@/components/DataVisualizations";
import ResourceGuide from "@/components/ResourceGuide";
import CommunityDashboard from "@/components/CommunityDashboard";
import UserProgress from "@/components/UserProgress";
import { useAuth } from "@/contexts/AuthContext";
import type { RegisterPayload } from "@/types/auth";
import { getUserImpactLevel } from "@/utils/impact-level";
import { getImpactRecent, getImpactSummary } from "@/lib/api";

const defaultMetrics = {
  totalItems: 0,
  co2Saved: 0,
  waterSaved: 0,
  energySaved: 0,
  recyclingRate: 0,
};

type LogEntry = {
  id: string;
  friendlyName?: string;
  material?: string;
  materialId?: string;
  method?: string;
  disposal_method?: string;
  weightGrams?: number;
  impactValue?: number;
  impact_value?: number;
  co2Reduction?: number;
  waterSavings?: number;
  energySavings?: number;
  nudgeText?: string;
  nudge_text?: string;
  timestamp?: string;
  impact?: {
    co2Reduction?: number;
    waterSavings?: number;
    energySavings?: number;
  };
};

export default function TrackMyImpact() {
  const { user, loading: authLoading, error: authError, login, register, logout } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPending, setAuthPending] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    location: "",
  });
  const [authFormError, setAuthFormError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [userLogs, setUserLogs] = useState<LogEntry[]>([]);
  const [localMetrics, setLocalMetrics] = useState(defaultMetrics);
  const [serverSummary, setServerSummary] = useState<{ total_items: number; total_impact_value: number } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const storageKey = useMemo(() => (user ? `track-my-impact-logs-${user.id}` : null), [user]);
  const visitedKey = useMemo(() => (user ? `track-my-impact-visited-${user.id}` : null), [user]);

  const calculateLocalMetrics = useCallback((logs: LogEntry[]) => {
    if (!logs.length) {
      return { ...defaultMetrics };
    }
    const totalItems = logs.length;
    const co2Saved = logs.reduce((sum, log) => sum + (log.impactValue ?? log.impact_value ?? log.co2Reduction ?? log.impact?.co2Reduction ?? 0), 0);
    const waterSaved = logs.reduce((sum, log) => sum + (log.waterSavings ?? log.impact?.waterSavings ?? 0), 0);
    const energySaved = logs.reduce((sum, log) => sum + (log.energySavings ?? log.impact?.energySavings ?? 0), 0);
    const recycledItems = logs.filter((log) => {
      const method = (log.method || log.disposal_method || "").toString().toLowerCase();
      return method === "recycled";
    }).length;
    const recyclingRate = totalItems > 0 ? (recycledItems / totalItems) * 100 : 0;
    return { totalItems, co2Saved, waterSaved, energySaved, recyclingRate };
  }, []);

  const reloadLocalLogs = useCallback(() => {
    if (!storageKey) {
      setUserLogs([]);
      setLocalMetrics({ ...defaultMetrics });
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setUserLogs(stored);
      setLocalMetrics(calculateLocalMetrics(stored));
    } catch (error) {
      console.error("Failed to read local logs", error);
      setUserLogs([]);
      setLocalMetrics({ ...defaultMetrics });
    }
  }, [storageKey, calculateLocalMetrics]);

  const refreshServerData = useCallback(async () => {
    if (!user) return;
    try {
      const [summary, recent] = await Promise.all([
        getImpactSummary(),
        getImpactRecent(25),
      ]);
      setServerSummary(summary);

      const remoteLogs: LogEntry[] = recent.map((entry) => ({
        id: entry.id,
        friendlyName: entry.material_id,
        disposal_method: entry.disposal_method,
        weightGrams: entry.weight_grams,
        impactValue: entry.impact_value,
        nudgeText: entry.nudge_text,
        timestamp: entry.created_at,
      }));

      if (storageKey) {
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const mergedMap = new Map<string, LogEntry>();
        for (const log of existing as LogEntry[]) {
          mergedMap.set(log.id, log);
        }
        for (const log of remoteLogs) {
          mergedMap.set(log.id, { ...mergedMap.get(log.id), ...log });
        }
        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        });
        localStorage.setItem(storageKey, JSON.stringify(merged));
        setUserLogs(merged);
        setLocalMetrics(calculateLocalMetrics(merged));
      }
      setServerError(null);
    } catch (error: any) {
      console.error("Unable to load server metrics", error);
      setServerError(error?.message || "Failed to load impact data from server.");
    }
  }, [user, storageKey, calculateLocalMetrics]);

  useEffect(() => {
    if (!user) {
      setUserLogs([]);
      setLocalMetrics({ ...defaultMetrics });
      setServerSummary(null);
      setShowOnboarding(false);
      return;
    }
    reloadLocalLogs();
    void refreshServerData();
  }, [user, reloadLocalLogs, refreshServerData]);

  useEffect(() => {
    if (!user || !visitedKey) return;
    const visited = localStorage.getItem(visitedKey);
    if (visited) {
      setShowOnboarding(false);
      setActiveTab("dashboard");
    } else {
      setShowOnboarding(true);
    }
  }, [user, visitedKey]);

  const handleCompleteOnboarding = useCallback(() => {
    if (visitedKey) {
      localStorage.setItem(visitedKey, "true");
    }
    setShowOnboarding(false);
    setActiveTab("dashboard");
  }, [visitedKey]);

  const handleAuthInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthPending(true);
    setAuthFormError(null);
    try {
      if (authMode === "login") {
        await login(authForm.username, authForm.password);
      } else {
        const payload: RegisterPayload = {
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
          full_name: authForm.full_name || undefined,
          location: authForm.location || undefined,
        };
        await register(payload);
      }
      setAuthForm({ username: "", email: "", password: "", full_name: "", location: "" });
    } catch (error: any) {
      setAuthFormError(error?.message || "Unable to authenticate");
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab("dashboard");
  };

  const handleLogRefresh = useCallback(() => {
    reloadLocalLogs();
    void refreshServerData();
    setRefreshSignal((signal) => signal + 1);
  }, [reloadLocalLogs, refreshServerData]);

const resolvedTotalItems =
  serverSummary && serverSummary.total_items > 0
    ? serverSummary.total_items
    : localMetrics.totalItems;
const resolvedCo2Saved =
  serverSummary && Math.abs(serverSummary.total_impact_value) > 0
    ? serverSummary.total_impact_value
    : localMetrics.co2Saved;
const levelInfo = getUserImpactLevel(resolvedCo2Saved);

const userStats = {
  totalItems: resolvedTotalItems,
  co2Saved: resolvedCo2Saved,
  waterSaved: localMetrics.waterSaved,
  energySaved: localMetrics.energySaved,
  recyclingRate: localMetrics.recyclingRate,
  level: levelInfo.level,
  badge: levelInfo.badge,
  };

    useEffect(() => {
    try {
      localStorage.removeItem('track-my-impact-logs');
      localStorage.removeItem('track-my-impact-visited');
    } catch (error) {
      console.warn('Unable to clear legacy localStorage keys', error);
    }
  }, []);

const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, description: "Your impact overview" },
    { id: "classify", label: "AI Classify", icon: Camera, description: "Upload & classify waste" },
    { id: "logger", label: "Log Waste", icon: BarChart3, description: "Manual waste entry" },
    { id: "data", label: "Data Insights", icon: Globe, description: "SA & global trends" },
    { id: "community", label: "Community", icon: Users, description: "Collective impact" },
    { id: "resources", label: "Resources", icon: BookOpen, description: "Disposal guidance" },
    { id: "progress", label: "My Progress", icon: Target, description: "Track your impact" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Track My Impact</CardTitle>
            <CardDescription>
              {authMode === "login" ? "Sign in to access your impact dashboard" : "Create an account to start tracking"}
            </CardDescription>
            {authError && (
              <p className="text-sm text-red-600 mt-2">{authError}</p>
            )}
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Button
                  type="button"
                  variant={authMode === "login" ? "default" : "outline"}
                  onClick={() => setAuthMode("login")}
                  className="flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" /> Login
                </Button>
                <Button
                  type="button"
                  variant={authMode === "register" ? "default" : "outline"}
                  onClick={() => setAuthMode("register")}
                  className="flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Register
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="auth-username">Username</label>
                <Input
                  id="auth-username"
                  name="username"
                  value={authForm.username}
                  onChange={handleAuthInputChange}
                  required
                />
              </div>

              {authMode === "register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="auth-email">Email</label>
                  <Input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={authForm.email}
                    onChange={handleAuthInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="auth-password">Password</label>
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  required
                />
              </div>

              {authMode === "register" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="auth-full-name">Full name (optional)</label>
                    <Input
                      id="auth-full-name"
                      name="full_name"
                      value={authForm.full_name}
                      onChange={handleAuthInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="auth-location">Location (optional)</label>
                    <Input
                      id="auth-location"
                      name="location"
                      value={authForm.location}
                      onChange={handleAuthInputChange}
                    />
                  </div>
                </div>
              )}

              {authFormError && (
                <p className="text-sm text-red-600">{authFormError}</p>
              )}

              <Button type="submit" className="w-full" disabled={authPending}>
                {authPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {authMode === "login" ? "Signing in" : "Creating account"}
                  </>
                ) : authMode === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showOnboarding) {
    return <WelcomeOnboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-green-600 rounded-lg">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Track My Impact</h1>
                <p className="text-sm text-gray-600">Waste Classification & Environmental Calculator</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">{userStats.badge}</span>
                <span className="font-medium">{userStats.level}</span>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 hidden md:inline-flex">
                {userStats.totalItems} items logged
              </Badge>
              <Button asChild size="sm" className="bg-white text-green-700 hover:bg-green-100 border border-green-300">
                <Link href="/calculator">Calculator</Link>
              </Button>
              <Button asChild size="sm" className="bg-white text-green-700 hover:bg-green-100 border border-green-300">
                <Link href="/about">About</Link>
              </Button>
              <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={handleLogout}>
                Sign out
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 py-6">
        {serverError && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-2 text-red-700 py-3">
              <AlertCircle className="h-4 w-4" />
              <span>{serverError}</span>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 mb-8 h-auto p-2 bg-white/60 backdrop-blur-sm">
              {navigationItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                >
                  <item.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-xs">{item.label}</div>
                    <div className="text-[10px] text-gray-500 hidden sm:block">{item.description}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard">
                <MainDashboard userStats={userStats} setActiveTab={setActiveTab} />
              </TabsContent>

              <TabsContent value="classify">
                <AIClassification onItemLogged={handleLogRefresh} storageKey={storageKey} />
              </TabsContent>

              <TabsContent value="logger">
                <WasteLogger onItemLogged={handleLogRefresh} storageKey={storageKey} />
              </TabsContent>

              <TabsContent value="data">
                <DataVisualizations />
              </TabsContent>

              <TabsContent value="community">
                <CommunityDashboard refreshSignal={refreshSignal} />
              </TabsContent>

              <TabsContent value="resources">
                <ResourceGuide />
              </TabsContent>

              <TabsContent value="progress">
                <UserProgress userStats={userStats} logs={userLogs} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </>
  );
}
