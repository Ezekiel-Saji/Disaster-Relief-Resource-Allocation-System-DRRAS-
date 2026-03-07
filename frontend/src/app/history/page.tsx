import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function HistoryPage() {
  const history = [
    { id: 1, area: "Area #1", type: "Flood", severity: "High", year: 2023 },
    { id: 2, area: "Area #2", type: "Drought", severity: "Medium", year: 2022 },
    { id: 3, area: "Area #1", type: "Cyclone", severity: "Critical", year: 2021 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disaster History</h1>
        <p className="text-muted-foreground mt-1">Archived records of past events for trend analysis.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Historical Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Disaster Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.area}</TableCell>
                  <TableCell>{h.type}</TableCell>
                  <TableCell>{h.severity}</TableCell>
                  <TableCell>{h.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
