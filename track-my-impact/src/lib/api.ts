// Simple API client for backend integration

import type { RegisterPayload } from "@/types/auth";
import type { UserProfile } from "@/types/user";

type TokenBundle = { access_token: string; refresh_token?: string; token_type?: string };

type ImpactCalculationResponse = {
  impact_id: string;
  material_id: string;
  disposal_method: string;
  weight_grams: number;
  impact_value: number;
  nudge_text: string;
  created_at: string;
};

type RecentImpact = {
  id: string;
  material_id: string;
  disposal_method: string;
  weight_grams: number;
  impact_value: number;
  nudge_text: string;
  created_at: string;
};

type ActivitySummary = {
  total_items: number;
  total_impact_value: number;
};

type CommunityStats = {
  user_total_impact: number;
  user_total_items: number;
  community_average_impact: number;
  community_size: number;
};

type LeaderboardEntry = {
  rank: number;
  username: string;
  total_impact_value: number;
  total_items: number;
};

type LeaderboardPayload = {
  entries: LeaderboardEntry[];
  generated_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "tmi_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    const message = text || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : ((await res.text()) as T);
}

function assertAuthenticated() {
  if (!getToken()) {
    throw new Error("Authentication required");
  }
}

export function getApiBase() {
  return API_BASE;
}

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  const profile = await apiFetch<UserProfile>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return profile;
}

export async function login(username: string, password: string): Promise<string> {
  const tok = await apiFetch<TokenBundle>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return tok.access_token;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Logout request failed", error);
  } finally {
    clearToken();
  }
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  assertAuthenticated();
  return apiFetch<UserProfile>("/api/auth/me", { method: "GET" });
}

export async function classifyWaste(
  materialId: string,
  disposalMethod: string,
  weightGrams: number
): Promise<ImpactCalculationResponse> {
  assertAuthenticated();
  return apiFetch<ImpactCalculationResponse>("/api/impact/calculate", {
    method: "POST",
    body: JSON.stringify({
      material_id: materialId,
      disposal_method: disposalMethod,
      weight_grams: weightGrams,
    }),
  });
}

export async function getImpactRecent(limit = 10): Promise<RecentImpact[]> {
  assertAuthenticated();
  return apiFetch<RecentImpact[]>(`/api/impact/recent?limit=${limit}`);
}

export async function getImpactSummary(): Promise<ActivitySummary> {
  assertAuthenticated();
  return apiFetch<ActivitySummary>("/api/impact/summary");
}

export async function getCommunityStats(): Promise<CommunityStats> {
  assertAuthenticated();
  return apiFetch<CommunityStats>("/api/community/stats");
}

export async function getLeaderboard(): Promise<LeaderboardPayload> {
  assertAuthenticated();
  return apiFetch<LeaderboardPayload>("/api/community/leaderboard");
}
