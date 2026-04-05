"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CloudLightning, Droplets, Wind, Thermometer, Loader2, RefreshCw, Smartphone, Globe, Calendar, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocalWeather {
  id: number;
  area_id: number;
  area_name: string;
  rainfall: number;
  humidity: number;
  wind_speed: number;
  temperature: number;
  pressure: number;
  observation_date: string;
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<LocalWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weather/sync");
      const data = await res.json();
      if (data.results) {
        setWeatherData(data.results);
      }
    } catch (error) {
      console.error("Error syncing weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    await fetchWeather();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
          <Globe className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tighter uppercase">Initializing Meteorological Sync</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none">Polling Regional Sensor Network...</p>
        </div>
      </div>
    );
  }

  const avgRainfall = (weatherData.reduce((acc, curr) => acc + curr.rainfall, 0) / (weatherData.length || 1)).toFixed(1);
  const avgHumidity = (weatherData.reduce((acc, curr) => acc + curr.humidity, 0) / (weatherData.length || 1)).toFixed(1);
  const avgWind = (weatherData.reduce((acc, curr) => acc + curr.wind_speed, 0) / (weatherData.length || 1)).toFixed(1);
  const avgTemp = (weatherData.reduce((acc, curr) => acc + curr.temperature, 0) / (weatherData.length || 1)).toFixed(1);
  const avgPressure = (weatherData.reduce((acc, curr) => acc + (curr.pressure || 0), 0) / (weatherData.length || 1)).toFixed(0);

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-black px-2 uppercase tracking-tighter">LIVE METRICS</Badge>
             <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Meteorological Monitoring</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time environmental data acquisition from distributed regional sensors.</p>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={syncing}
          variant="outline"
          className="h-11 border-primary/20 hover:bg-primary/5 font-black uppercase tracking-widest text-xs gap-2 shadow-sm"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          FORCE SENSOR RE-POLL
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          icon={<Droplets className="text-blue-500" />} 
          label="Avg. Rainfall" 
          value={`${avgRainfall}mm`} 
          color="blue"
        />
        <MetricCard 
          icon={<CloudLightning className="text-yellow-500" />} 
          label="Avg. Humidity" 
          value={`${avgHumidity}%`} 
          color="yellow"
        />
        <MetricCard 
          icon={<Wind className="text-primary" />} 
          label="Avg. Wind Speed" 
          value={`${avgWind}km/h`} 
          color="primary"
        />
        <MetricCard 
          icon={<Thermometer className="text-destructive" />} 
          label="Avg. Temp" 
          value={`${avgTemp}°C`} 
          color="red"
        />
        <MetricCard 
          icon={<Gauge className="text-purple-500" />} 
          label="Avg. Pressure" 
          value={`${avgPressure}hPa`} 
          color="purple"
        />
      </div>

      <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b border-primary/5 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">Regional Observation Log</CardTitle>
              <CardDescription className="font-bold text-xs uppercase tracking-widest opacity-60">Master Census of Meteorological Factors</CardDescription>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active Link</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {weatherData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-bold uppercase tracking-tight italic opacity-40">
              Station link established. Awaiting initial sensor data packets...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest py-5">Observation Zone</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Precipitation</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Humidity</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Vector Speed</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Pressure</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Temperature</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-right">Observation Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherData.map((r, i) => (
                  <TableRow key={r.id} className="border-primary/5 transition-colors hover:bg-primary/5 group">
                    <TableCell className="font-black text-primary py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-all">
                          {i + 1}
                        </div>
                        {r.area_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">{r.rainfall}mm</TableCell>
                    <TableCell className="font-bold text-yellow-600">{r.humidity}%</TableCell>
                    <TableCell className="font-bold text-indigo-600">{r.wind_speed?.toFixed(1)}km/h</TableCell>
                    <TableCell className="font-bold text-purple-600">{r.pressure}hPa</TableCell>
                    <TableCell className="font-bold text-destructive">{r.temperature?.toFixed(1)}°C</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-muted-foreground">{r.observation_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 text-white">
         <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden p-8">
            <Smartphone className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 rotate-12 text-white" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">System Status: CALIBRATED</h3>
            <p className="text-sm font-bold opacity-80 leading-relaxed max-w-md">
               The meteorological sync engine is currently polling distributed API nodes for regional updates. All data packets are timestamped and cryptographically logged to the primary historical archive.
            </p>
         </Card>
         <Card className="border-none shadow-xl bg-card border-l-8 border-l-primary p-8 flex flex-col justify-center">
            <h3 className="text-xl font-black uppercase tracking-tight text-primary mb-2 line-clamp-1">Data Persistence Protocol</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed font-black">
               Daily records are singleton-locked per area id to prevent redundant logging. The sync trigger executes automatically upon dashboard entry if current-date indices are detected as null.
            </p>
         </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-600",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
    primary: "bg-primary/10 border-primary/20 text-primary",
    red: "bg-red-500/10 border-red-500/20 text-red-600",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-600",
  };

  return (
    <Card className={`${colorMap[color]} border-2 shadow-lg transition-transform hover:scale-[1.02] duration-300`}>
      <CardContent className="p-6 pt-6 flex flex-col items-center text-center gap-2">
        <div className="bg-background/80 p-3 rounded-2xl shadow-sm mb-1">{icon}</div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-3xl font-black tracking-tighter leading-none">{value}</p>
      </CardContent>
    </Card>
  );
}
