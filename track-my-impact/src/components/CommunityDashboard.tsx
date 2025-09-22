/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

CommunityDashboard.tsx: Community benchmarking panel showing aggregate savings and the live leaderboard.
*/
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, TrendingUp } from "lucide-react";

import { getCommunityStats, getLeaderboard } from "@/lib/api";

type CommunityStats = Awaited<ReturnType<typeof getCommunityStats>>;
type LeaderboardPayload = Awaited<ReturnType<typeof getLeaderboard>>;

interface CommunityDashboardProps {
  refreshSignal?: number;
}

/**
 * Pulls community-wide stats and a leaderboard from the backend for quick benchmarking.
 */
export default function CommunityDashboard({ refreshSignal = 0 }: CommunityDashboardProps) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload["entries"]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both the aggregate metrics and leaderboard in one network round-trip.
  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, leaderboardResponse] = await Promise.all([
        getCommunityStats(),
        getLeaderboard(),
      ]);
      setStats(statsResponse);
      setLeaderboard(leaderboardResponse.entries);
      setGeneratedAt(leaderboardResponse.generated_at);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load community data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial hydration when the dashboard first renders client-side.
  useEffect(() => {
    loadCommunityData();
  }, []);

  // Allow parent components to trigger refreshes after a successful log.
  useEffect(() => {
    if (refreshSignal > 0) {
      loadCommunityData();
    }
  }, [refreshSignal]);

  const userVsAverage = stats
    ? stats.user_total_impact - stats.community_average_impact
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Community Impact</h2>
          <p className="text-gray-600">
            Compare your avoided emissions with the Track My Impact community.
          </p>
        </div>
        <Button onClick={loadCommunityData} variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Users className="h-5 w-5" />
              Your Contribution
            </CardTitle>
            <CardDescription>Your cumulative landfill savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {stats ? stats.user_total_impact.toFixed(2) : "0.00"} kg CO₂e
                </div>
                <p className="text-sm text-gray-600">
                  Logged across {stats ? stats.user_total_items : 0} entries
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
              Community Average
            </CardTitle>
            <CardDescription>Average avoided CO₂ per member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {stats ? stats.community_average_impact.toFixed(2) : "0.00"} kg CO₂e
                </div>
                <p className="text-sm text-gray-600">
                  Based on {stats ? stats.community_size : 0} active members
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Trophy className="h-5 w-5" />
              How You Compare
            </CardTitle>
            <CardDescription>Difference vs community average</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${userVsAverage >= 0 ? "text-green-700" : "text-rose-700"}`}>
                  {userVsAverage >= 0 ? "+" : ""}{userVsAverage.toFixed(2)} kg CO₂e
                </div>
                <p className="text-sm text-gray-600">
                  {userVsAverage >= 0
                    ? "You're outperforming the average community impact!"
                    : "Catch up to the community average by logging more sustainable choices."}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Top Community Savers</CardTitle>
            <CardDescription>Leaderboard of avoided CO₂ savings</CardDescription>
          </div>
          {generatedAt && <span className="text-xs text-gray-500">Updated {new Date(generatedAt).toLocaleString()}</span>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-gray-600">No leaderboard data yet. Be the first to log an impact!</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.username}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-10 justify-center">
                      #{entry.rank}
                    </Badge>
                    <div>
                      <p className="font-semibold text-gray-900">{entry.username}</p>
                      <p className="text-xs text-gray-600">{entry.total_items} items logged</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">{entry.total_impact_value.toFixed(2)} kg CO₂e</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
