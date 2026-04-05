"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Brain, Loader2, Thermometer, Droplets, CloudRain, Wind, AlertTriangle, RefreshCcw, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WeatherData {
  area_id: number;
  area_name: string;
  latitude: number;
  longitude: number;
  id: number;
  observation_date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  pressure: number;
}

interface PredictionResult {
  predicted_disaster_type: string;
  risk_score: number;
  confidence_level: number;
  predicted_date: string;
  reasoning: string;
}

export default function PredictionsPage() {
  const [weatherGroups, setWeatherGroups] = useState<Record<string, WeatherData[]>>({});
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [loading, setLoading] = useState(true);
  const [predictingArea, setPredictingArea] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Fetching from the view as requested
      const { data, error } = await supabase
        .from("v_ai_weather_data")
        .select("*")
        .order("observation_date", { ascending: false });
      
      if (error) throw error;

      // Group weather observations by area_name
      const groups = (data as WeatherData[]).reduce((acc, curr) => {
        if (!acc[curr.area_name]) acc[curr.area_name] = [];
        acc[curr.area_name].push(curr);
        return acc;
      }, {} as Record<string, WeatherData[]>);

      setWeatherGroups(groups);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async (areaName: string) => {
    setPredictingArea(areaName);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areaName,
          // Sending the most recent observations for contextual prediction
          weatherData: weatherGroups[areaName].slice(0, 14), 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Prediction failed with status ${res.status}`);
      }
      const result = await res.json();
      setPredictions((prev) => ({ ...prev, [areaName]: result }));
    } catch (error: any) {
      console.error("CRITICAL PREDICTION ERROR:", error.message || error);
    } finally {
      setPredictingArea(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Syncing with meteorological sensors...</p>
      </div>
    );
  }

  const areaNames = Object.keys(weatherGroups);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Disaster Forecast
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Harnessing Gemini AI to predict environmental shifts and disaster probabilities.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchWeatherData} 
          className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Sensors
        </Button>
      </div>

      {areaNames.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CardDescription>No weather data found in the system. Please ensure v_ai_weather_data is populated.</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {areaNames.map((areaName) => {
            const areaData = weatherGroups[areaName];
            const latest = areaData[0];
            const prediction = predictions[areaName];

            return (
              <Card key={areaName} className="overflow-hidden border-none shadow-xl bg-card transition-all hover:shadow-2xl ring-1 ring-white/10">
                <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-2 h-8 bg-primary rounded-full" />
                      {areaName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 font-medium">
                      <span className="flex items-center gap-1"><span className="text-primary opacity-70">LAT</span> {latest.latitude.toFixed(4)}</span>
                      <span className="flex items-center gap-1"><span className="text-primary opacity-70">LON</span> {latest.longitude.toFixed(4)}</span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!prediction ? (
                      <Button 
                        onClick={() => runPrediction(areaName)} 
                        disabled={predictingArea === areaName}
                        size="lg"
                        className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      >
                        {predictingArea === areaName ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Run Oracle Prediction
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                         <Badge 
                           className={`h-9 px-4 text-sm font-bold shadow-md ${
                             prediction.risk_score > 7 
                               ? "bg-destructive text-destructive-foreground" 
                               : "bg-emerald-500 text-white"
                           }`}
                         >
                           {prediction.predicted_disaster_type}
                         </Badge>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => runPrediction(areaName)}
                           disabled={predictingArea === areaName}
                           className="h-9 w-9 rounded-full hover:bg-primary/10"
                         >
                           {predictingArea === areaName ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                         </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Weather Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <MetricCard 
                      icon={<Thermometer className="text-orange-500" />} 
                      label="Temperature" 
                      value={`${latest.temperature}°C`} 
                      color="orange"
                    />
                    <MetricCard 
                      icon={<Droplets className="text-blue-500" />} 
                      label="Humidity" 
                      value={`${latest.humidity}%`} 
                      color="blue"
                    />
                    <MetricCard 
                      icon={<CloudRain className="text-indigo-500" />} 
                      label="Rainfall" 
                      value={`${latest.rainfall}mm`} 
                      color="indigo"
                    />
                    <MetricCard 
                      icon={<Wind className="text-teal-500" />} 
                      label="Wind Speed" 
                      value={`${latest.wind_speed}km/h`} 
                      color="teal"
                    />
                    <MetricCard 
                      icon={<Gauge className="text-purple-500" />} 
                      label="Pressure" 
                      value={`${latest.pressure}hPa`} 
                      color="purple"
                    />
                  </div>

                  {/* AI Prediction Section */}
                  {prediction && (
                    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                        <div className="flex items-center gap-2 font-bold text-lg">
                          <Brain className="w-6 h-6 text-primary" />
                          Gemini Intelligence Report
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                          <span className="text-xs font-semibold text-primary uppercase tracking-tight">AI Confidence</span>
                          <span className="text-sm font-black text-primary">{prediction.confidence_level}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Risk Severity</p>
                          <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1">
                                <span className={`text-sm font-bold ${prediction.risk_score > 7 ? 'text-destructive' : 'text-emerald-500'}`}>
                                  {prediction.risk_score > 7 ? 'CRITICAL' : prediction.risk_score > 4 ? 'MODERATE' : 'STABLE'}
                                </span>
                                <span className="text-lg font-black">{prediction.risk_score}/10</span>
                             </div>
                             <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    prediction.risk_score > 7 ? 'bg-destructive' : 'bg-emerald-500'
                                  }`} 
                                  style={{ width: `${prediction.risk_score * 10}%` }}
                                />
                             </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Predicted Phenomenon</p>
                          <p className="text-2xl font-black">{prediction.predicted_disaster_type}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Probability Horizon</p>
                          <p className="text-2xl font-black text-primary/80">{prediction.predicted_date}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-primary/10">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Predictive Reasoning</p>
                        <p className="text-base text-card-foreground leading-relaxed font-medium">
                          {prediction.reasoning}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer / Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <Card className="md:col-span-2 p-8 border-none bg-gradient-to-br from-card to-card/50 shadow-lg">
          <CardHeader className="p-0 mb-6">
             <CardTitle className="text-xl flex items-center gap-2">
               <Activity className="w-6 h-6 text-primary" /> Multi-Area Risk Overview
             </CardTitle>
          </CardHeader>
          <div className="h-[240px] flex items-center justify-center text-muted-foreground bg-secondary/10 rounded-2xl border-2 border-dashed border-primary/10">
             <div className="flex flex-col items-center gap-3">
               <CloudRain className="w-10 h-10 opacity-20" />
               <p className="font-medium">Geospatial risk heatmap arriving in next update</p>
             </div>
          </div>
        </Card>
        
        <Card className="p-8 border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20">
          <CardHeader className="p-0 mb-6">
             <CardTitle className="text-xl flex items-center gap-2">
               <Brain className="w-6 h-6" /> System Intelligence
             </CardTitle>
          </CardHeader>
          <div className="space-y-6">
             <div className="space-y-2">
               <p className="text-sm opacity-90 leading-relaxed font-medium">
                 "Neural analysis is monitoring {areaNames.length} sectors. Atmospheric patterns indicate stable conditions with localized variance in precipitation levels."
               </p>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-white/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-black">{areaNames.length}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Areas</p>
               </div>
               <div className="bg-white/10 p-4 rounded-xl text-center">
                  <p className="text-2xl font-black">G 2.5 F</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Model</p>
               </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    orange: "border-orange-500/20 bg-orange-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    indigo: "border-indigo-500/20 bg-indigo-500/5",
    teal: "border-teal-500/20 bg-teal-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all hover:scale-105 duration-300 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-background rounded-lg shadow-sm">{icon}</div>
      </div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
