"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  ClipboardCheck, 
  Calendar, 
  Hash, 
  Loader2, 
  AlertTriangle,
  PackageCheck,
  MapPin,
  ArrowRightLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { triggerInAppNotification } from "@/lib/page-notifications";

interface DeliveryReport {
  report_id: number;
  dispatch_id: number;
  delivered_to: string;
  resource: string;
  dispatched_quantity: number;
  received_quantity: number;
  delivery_date: string;
  discrepancy: number;
  verification_status: string;
}

export default function DeliveriesPage() {
  const [reports, setReports] = useState<DeliveryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitDispatches, setTransitDispatches] = useState<any[]>([]);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dispatch_id: "",
    received_quantity: "",
  });

  useEffect(() => {
    fetchReports();
    fetchMetadata();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("v_delivery_reports")
        .select("*")
        .order("delivery_date", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const { data, error } = await supabase
        .from("v_dispatches")
        .select("*")
        .eq("status", "In Transit");
      
      if (error) throw error;
      setTransitDispatches(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
  }

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc(
        "fn_record_delivery",
        {
          p_dispatch_id: parseInt(formData.dispatch_id),
          p_received_qty: parseInt(formData.received_quantity)
        }
      );

      if (error) throw error;

      await fetchReports();
      await fetchMetadata();

      setIsRecordOpen(false);
      setFormData({
        dispatch_id: "",
        received_quantity: "",
      });
      triggerInAppNotification({
        page: "/deliveries",
        title: "Delivery recorded",
        message: "The delivery report has been recorded successfully. Verification and discrepancy details have been updated.",
        type: "Delivery",
      });

    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
      alert("Failed to record delivery. Please ensure the dispatch ID is valid.");
    } finally {
      setSubmitting(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white font-bold">Verified</Badge>;
      case "Partial":
        return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50 font-bold">Partial</Badge>;
      case "Failed":
        return <Badge variant="destructive" className="font-bold">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Delivery Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm italic">Verification and audit log for all resource handovers at destination areas.</p>
        </div>

        <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg border-none text-white font-bold" />}>
            <PackageCheck className="w-4 h-4" /> Record Delivery
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" /> Confirm Delivery
              </DialogTitle>
              <DialogDescription>
                Confirm receipt of resources and report any quantity discrepancies.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRecord}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="dispatch_id" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> Transit Dispatch
                  </Label>
                  <Select 
                    value={formData.dispatch_id} 
                    onValueChange={(val) => setFormData({...formData, dispatch_id: val ?? ""})}
                  >
                    <SelectTrigger id="dispatch_id" className="bg-muted/30">
                      <SelectValue placeholder="Select Dispatch ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {transitDispatches.length === 0 ? (
                        <SelectItem value="none" disabled>No active shipments in transit</SelectItem>
                      ) : (
                        transitDispatches.map((disp) => (
                          <SelectItem key={disp.dispatch_id} value={disp.dispatch_id.toString()}>
                            Disp #{disp.dispatch_id} - {disp.resource} ({disp.destination_area})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="received_quantity" className="flex items-center gap-2 font-semibold">
                    Received Units (Actual Count)
                  </Label>
                  <Input
                    id="received_quantity"
                    type="number"
                    placeholder="Enter confirmed quantity"
                    value={formData.received_quantity}
                    onChange={(e) => setFormData({ ...formData, received_quantity: e.target.value })}
                    required
                    className="bg-muted/30 font-bold text-lg text-primary text-center"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Receipt...
                    </>
                  ) : (
                    "Confirm Receipt & Close Dispatch"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Completed Deliveries Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-32 font-bold">Rep ID</TableHead>
                <TableHead className="font-bold">Dispatch Info</TableHead>
                <TableHead className="font-bold">Quantity Audit</TableHead>
                <TableHead className="font-bold text-center">Delivery Date</TableHead>
                <TableHead className="text-right pr-6 font-bold">Verification Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="font-medium">Auditing delivery reports...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No confirmed deliveries in record.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.report_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-extrabold text-muted-foreground">#{report.report_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-muted text-muted-foreground uppercase tracking-tight">
                            Disp #{report.dispatch_id}
                          </Badge>
                          <span className="font-bold text-sm">{report.resource}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium ml-1">
                          <MapPin className="w-3 h-3" /> To {report.delivered_to}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="text-muted-foreground line-through decoration-muted-foreground/50">{report.dispatched_quantity}</span>
                          <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                          <span className="text-green-700">{report.received_quantity}</span>
                        </div>
                        {report.discrepancy !== 0 && (
                          <span className="text-[10px] font-extrabold text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Discrepancy: {report.discrepancy}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {report.delivery_date ? new Date(report.delivery_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {getVerificationBadge(report.verification_status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
