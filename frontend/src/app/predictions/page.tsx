import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PredictionsPage() {
  const predictions = [
    { id: 1, area: "Area #4", type: "Flood", risk: 8.8, date: "2024-04-15", confidence: "92%" },
    { id: 2, area: "Area #2", type: "Hurricane", risk: 4.2, date: "2024-05-10", confidence: "65%" },
    { id: 3, area: "Area #1", type: "Landslide", risk: 7.5, date: "2024-04-20", confidence: "88%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Prediction</h1>
        <p className="text-muted-foreground mt-1">AI-driven forecasts for potential disaster occurrences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Future Risk Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Area</TableHead>
                <TableHead>Predicted Type</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Predicted Date</TableHead>
                <TableHead>ML Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.area}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>
                    <Badge variant={p.risk > 7 ? "destructive" : "secondary"}>
                      {p.risk}/10
                    </Badge>
                  </TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="text-primary font-bold">{p.confidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[200px] border-dashed flex items-center justify-center text-muted-foreground">Prediction Timeline Chart Placeholder</Card>
        <Card className="min-h-[200px] border-dashed flex items-center justify-center text-muted-foreground">Risk Heatmap Visualization Placeholder</Card>
      </div>
    </div>
  );
}
