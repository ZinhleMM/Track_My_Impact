/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

UserProgress.tsx: Historical feed and streak tracking for individual waste logs.
*/
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Star,
  TreePine,
  Droplets,
  Zap,
  Recycle
} from "lucide-react";

interface UserProgressProps {
  userStats: {
    totalItems: number;
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
    recyclingRate: number;
    level: string;
    badge: string;
  };
  logs?: Array<{
    id: string;
    date?: string | Date;
    timestamp?: string;
    created_at?: string;
    material?: string;
    friendlyName?: string;
    material_id?: string;
    method?: string;
    disposal_method?: string;
    weight?: number;
    weightGrams?: number;
    weight_grams?: number;
    co2Reduction?: number;
    impactValue?: number;
    impact_value?: number;
    energySavings?: number;
    waterSavings?: number;
    nudgeText?: string;
    nudge_text?: string;
    impact?: {
      co2Reduction?: number;
      energySavings?: number;
      waterSavings?: number;
    };
  }>;
}

/**
 * Displays historic logs and summary stats for the logged-in user.
 */
export default function UserProgress({ userStats, logs = [] }: UserProgressProps) {
  const achievements = [
    {
      id: "first_log",
      name: "First Steps",
      description: "Logged your first waste item",
      icon: "",
      completed: userStats.totalItems > 0,
      progress: userStats.totalItems > 0 ? 100 : 0
    },
    {
      id: "co2_milestone",
      name: "Carbon Saver",
      description: "Saved 10kg of CO₂ emissions",
      icon: "",
      completed: userStats.co2Saved >= 10,
      progress: Math.min((userStats.co2Saved / 10) * 100, 100)
    },
    {
      id: "consistency",
      name: "Consistent Logger",
      description: "Log items for 7 days",
      icon: "",
      completed: false, // Would need date tracking
      progress: 30
    },
    {
      id: "recycling_rate",
      name: "Recycling Champion",
      description: "Maintain 80% recycling rate",
      icon: "",
      completed: userStats.recyclingRate >= 80,
      progress: Math.min((userStats.recyclingRate / 80) * 100, 100)
    }
  ];

  const nextTargets = [
    {
      name: "Next CO₂ Goal",
      current: userStats.co2Saved,
      target: userStats.co2Saved < 5 ? 5 : userStats.co2Saved < 20 ? 20 : 50,
      unit: "kg CO₂",
      icon: TreePine,
      color: "green"
    },
    {
      name: "Water Savings",
      current: userStats.waterSaved,
      target: userStats.waterSaved < 100 ? 100 : userStats.waterSaved < 500 ? 500 : 1000,
      unit: "L water",
      icon: Droplets,
      color: "blue"
    },
    {
      name: "Energy Savings",
      current: userStats.energySaved,
      target: userStats.energySaved < 10 ? 10 : userStats.energySaved < 50 ? 50 : 100,
      unit: "kWh",
      icon: Zap,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h2>
        <p className="text-gray-600">
          Track your environmental impact journey and unlock achievements
        </p>
      </div>

      {/* Current Level */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-green-600" />
            Current Impact Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{userStats.badge}</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{userStats.level}</h3>
                <p className="text-gray-600">Keep making a difference!</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
              {userStats.totalItems} items logged
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span>{Math.min((userStats.co2Saved / 50) * 100, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min((userStats.co2Saved / 50) * 100, 100)} className="h-3" />
            <p className="text-xs text-gray-600">
              {userStats.co2Saved < 50 ? `${(50 - userStats.co2Saved).toFixed(1)}kg CO₂ to go` : "Maximum level achieved!"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock badges as you progress on your sustainability journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.completed ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm ${
                      achievement.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.completed && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>
                <Progress value={achievement.progress} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {achievement.progress.toFixed(0)}% complete
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Personal Targets
          </CardTitle>
          <CardDescription>Your next milestones to achieve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextTargets.map((target, index) => {
              const IconComponent = target.icon;
              const progress = Math.min((target.current / target.target) * 100, 100);

              return (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <IconComponent className={`h-6 w-6 text-${target.color}-600`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-gray-900">{target.name}</h4>
                      <span className="text-sm text-gray-600">
                        {target.current.toFixed(1)} / {target.target} {target.unit}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            My Waste Log
          </CardTitle>
          <CardDescription>Recent entries with impact and cumulative totals</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-600">No entries yet. Log an item to see it here.</p>
          ) : (
            <div className="space-y-2">
              {/* Show the ten most recent entries so users can spot patterns without leaving the page. */}
              {logs.slice(-10).reverse().map((log) => {
                const dateValue = log.timestamp || log.created_at || log.date;
                const d = dateValue ? new Date(dateValue) : undefined;
                const co2 = log.impactValue ?? log.impact_value ?? log.co2Reduction ?? log.impact?.co2Reduction ?? 0;
                const water = log.waterSavings ?? log.impact?.waterSavings ?? 0;
                const energy = log.energySavings ?? log.impact?.energySavings ?? 0;
                const weightRaw = log.weight ?? log.weightGrams ?? log.weight_grams ?? 0;
                const weightKg = log.weight !== undefined ? Number(weightRaw) : Number(weightRaw) / 1000;
                const method = (log.method || log.disposal_method || '').toString();
                const materialName = log.friendlyName || log.material || log.material_id || 'Item';
                const nudge = log.nudgeText || log.nudge_text;
                return (
                  <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{materialName}</div>
                      <div className="text-gray-600">{method.toUpperCase()} • {weightKg.toFixed(2)} kg{d ? ` • ${d.toLocaleDateString()}` : ''}</div>
                      {nudge && <div className="text-xs text-gray-500 mt-1">{nudge}</div>}
                    </div>
                    <div className="text-right text-gray-800">
                      <div>{co2.toFixed(2)} kg CO₂e</div>
                      <div className="text-xs text-gray-600">{water.toFixed(1)} L • {energy.toFixed(1)} kWh</div>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2 text-sm flex justify-between">
                <span className="font-medium text-gray-900">Cumulative total</span>
                <span className="text-gray-800">
                  {userStats.co2Saved.toFixed(2)} kg CO₂ • {userStats.waterSaved.toFixed(0)} L • {userStats.energySaved.toFixed(1)} kWh
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.co2Saved.toFixed(1)}kg</div>
            <p className="text-sm text-gray-600">Total CO₂ Saved</p>
            <p className="text-xs text-green-600 mt-1">
              Equivalent to {(userStats.co2Saved * 2.31).toFixed(1)} miles not driven
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.waterSaved.toFixed(0)}L</div>
            <p className="text-sm text-gray-600">Water Conserved</p>
            <p className="text-xs text-blue-600 mt-1">
              {Math.round(userStats.waterSaved / 10)} showers worth
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Recycle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userStats.recyclingRate.toFixed(0)}%</div>
            <p className="text-sm text-gray-600">Recycling Rate</p>
            <p className="text-xs text-purple-600 mt-1">
              {userStats.recyclingRate > 35 ? "Above SA average!" : "Room for improvement"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      {userStats.totalItems === 0 ? (
        <Card className="text-center bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-gray-600 mb-4">
              Log your first waste item to begin tracking your environmental impact
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Recycle className="h-4 w-4 mr-2" />
              Log Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Keep It Up!</h3>
            <p className="text-gray-600 mb-4">
              You're making a real difference. Every item you track contributes to a more sustainable future.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
