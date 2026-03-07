import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function CentersPage() {
  const centers = [
    { center_id: 1, location: "North Hub", storage_capacity: 5000 },
    { center_id: 2, location: "South Central", storage_capacity: 12000 },
    { center_id: 3, location: "East Port", storage_capacity: 8000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relief Centers</h1>
        <p className="text-muted-foreground mt-1">Manage warehouses and supply distribution hubs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Registered Centers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Storage Capacity (units)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centers.map((center) => (
                <TableRow key={center.center_id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">#{center.center_id}</TableCell>
                  <TableCell>{center.location}</TableCell>
                  <TableCell>{center.storage_capacity.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
