import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudLightning, Droplets, Wind, Thermometer } from "lucide-react";

export default function WeatherPage() {
  const weatherRecords = [
    { id: 1, area: "Area #1", rainfall: "25mm", humidity: "85%", wind: "30km/h", temp: "22°C", date: "2024-03-07" },
    { id: 2, area: "Area #2", rainfall: "10mm", humidity: "70%", wind: "15km/h", temp: "26°C", date: "2024-03-07" },
    { id: 3, area: "Area #3", rainfall: "150mm", humidity: "95%", wind: "80km/h", temp: "19°C", date: "2024-03-07" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather Monitoring</h1>
        <p className="text-muted-foreground mt-1">Live environmental data for affected regions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><Droplets className="w-8 h-8 mx-auto text-blue-500"/><p className="text-xs mt-2">Avg. Rainfall</p><p className="text-xl font-bold">61mm</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CloudLightning className="w-8 h-8 mx-auto text-yellow-500"/><p className="text-xs mt-2">Humidity</p><p className="text-xl font-bold">83%</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Wind className="w-8 h-8 mx-auto text-primary"/><p className="text-xs mt-2">Wind Speed</p><p className="text-xl font-bold">41km/h</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Thermometer className="w-8 h-8 mx-auto text-destructive"/><p className="text-xs mt-2">Temperature</p><p className="text-xl font-bold">22.3°C</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Observation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Rainfall</TableHead>
                <TableHead>Humidity</TableHead>
                <TableHead>Wind Speed</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weatherRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.area}</TableCell>
                  <TableCell>{r.rainfall}</TableCell>
                  <TableCell>{r.humidity}</TableCell>
                  <TableCell>{r.wind}</TableCell>
                  <TableCell>{r.temp}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
