import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function DeliveriesPage() {
  const deliveries = [
    { id: 1, dispatch_id: 202, received_quantity: 200, delivery_date: "2024-03-07" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Delivery Reports</h1>
        <p className="text-muted-foreground mt-1">Confirmed receipts of resources at affected areas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Dispatch ID</TableHead>
                <TableHead>Received Qty</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-right">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">#{delivery.id}</TableCell>
                  <TableCell>Disp #{delivery.dispatch_id}</TableCell>
                  <TableCell>{delivery.received_quantity}</TableCell>
                  <TableCell>{delivery.delivery_date}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
