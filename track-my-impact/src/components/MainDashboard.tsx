"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Zap,
  Droplets,
  TreePine,
  Recycle,
  Camera,
  BarChart3,
  Award,
  ArrowRight
} from "lucide-react";

interface MainDashboardProps {
  userStats: {
    totalItems: number;
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
    recyclingRate: number;
    level: string;
    badge: string;
  };
  setActiveTab: (tab: string) => void;
}

export default function MainDashboard({ userStats, setActiveTab }: MainDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Environmental Impact Dashboard</h2>
        <p className="text-gray-600">
          Track your waste management journey using scientifically accurate EPA WARM v15.2 calculations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">CO₂ Saved</p>
                <p className="text-2xl font-bold text-green-900">{userStats.co2Saved.toFixed(1)}kg</p>
              </div>
              <TreePine className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-700 mt-1">Using WARM v15.2 factors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Water Saved</p>
                <p className="text-2xl font-bold text-blue-900">{userStats.waterSaved.toFixed(0)}L</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700 mt-1">Life cycle assessment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Energy Saved</p>
                <p className="text-2xl font-bold text-purple-900">{userStats.energySaved.toFixed(1)}kWh</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-700 mt-1">Million BTU converted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Items Logged</p>
                <p className="text-2xl font-bold text-orange-900">{userStats.totalItems}</p>
              </div>
              <Recycle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-700 mt-1">Scientifically tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Level */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-green-600" />
            Your Impact Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{userStats.badge}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userStats.level}</h3>
                <p className="text-gray-600">Keep up the great work!</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {userStats.recyclingRate.toFixed(0)}% recycling rate
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span>{Math.min((userStats.co2Saved / 50) * 100, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min((userStats.co2Saved / 50) * 100, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('classify')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveTab('classify');
            }
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              AI Waste Classification
            </CardTitle>
            <CardDescription>
              Upload photos for instant waste identification using machine learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Powered by CNN with 89.2% accuracy
              </div>
              <Button variant="outline" size="sm">
                Start Classifying
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('logger')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActiveTab('logger');
            }
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Manual Waste Logging
            </CardTitle>
            <CardDescription>
              Record waste items with precise WARM v15.2 impact calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                EPA-verified environmental factors
              </div>
              <Button variant="outline" size="sm">
                Log Waste
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      {userStats.totalItems === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="mb-4">
              <Recycle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Started with Your First Entry</h3>
              <p className="text-gray-600">
                Begin tracking your environmental impact today using scientifically accurate calculations
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setActiveTab('classify')} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="h-4 w-4 mr-2" />
                Classify with AI
              </Button>
              <Button onClick={() => setActiveTab('logger')} variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Log Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
