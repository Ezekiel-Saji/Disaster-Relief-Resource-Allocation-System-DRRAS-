"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, PlusCircle, Calendar, Hash, Loader2, MapPin, Package } from "lucide-react";
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

interface Dispatch {
  dispatch_id: number;
  allocation_id: number;
  destination_area: string;
  resource: string;
  quantity: number;
  from_center: string;
  dispatch_date: string;
  expected_delivery_date: string | null;
  status: string;
  delivery_reported: boolean;
}

const STATUS_VARIANTS: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
  "In Transit": "outline",
  "Delivered": "default",
  "Pending": "secondary",
};

const STATUS_COLORS: Record<string, string> = {
  "In Transit": "border-blue-500 text-blue-600 font-bold bg-blue-50",
  "Delivered": "bg-green-500 hover:bg-green-600 text-white font-bold",
  "Pending": "bg-amber-100 text-amber-700 border-none font-bold",
};

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyAllocations, setReadyAllocations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    allocation_id: "",
    expected_delivery_date: "",
  });

  useEffect(() => {
    fetchDispatches();
    fetchMetadata();
  }, []);

  async function fetchDispatches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("v_dispatches")
        .select("*")
        .order("dispatch_date", { ascending: false });

      if (error) throw error;
      setDispatches(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const { data, error } = await supabase
        .from("v_ready_for_dispatch")
        .select("*");

      if (error) throw error;
      setReadyAllocations(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.rpc(
        "fn_create_dispatch",
        {
          p_allocation_id: parseInt(formData.allocation_id),
          p_expected_delivery: formData.expected_delivery_date || null
        }
      );

      if (error) throw error;

      await fetchDispatches();
      await fetchMetadata();

      setIsOpen(false);
      setFormData({
        allocation_id: "",
        expected_delivery_date: "",
      });
      triggerInAppNotification({
        page: "/dispatch",
        title: "Dispatch created",
        message: "The dispatch has been created successfully and is now ready for delivery monitoring.",
        type: "Dispatch",
      });

    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
      alert("Failed to create dispatch. Please check if the allocation exists and is ready.");
    } finally {
      setSubmitting(false);
    }
  };

  const inTransitCount = dispatches.filter((d) => d.status === "In Transit").length;
  const deliveredCount = dispatches.filter((d) => d.status === "Delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dispatch Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor outgoing resource dispatches linked to allocations.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-md" />}>
            <PlusCircle className="w-4 h-4" /> New Dispatch
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-primary">Create Dispatch Order</DialogTitle>
              <DialogDescription>
                Link a dispatch to an authorized allocation not yet in transit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="allocation_id" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> Ready Allocation
                  </Label>
                  <Select
                    value={formData.allocation_id}
                    onValueChange={(val) => setFormData({ ...formData, allocation_id: val ?? "" })}
                  >
                    <SelectTrigger id="allocation_id" className="bg-muted/30">
                      <SelectValue placeholder="Select Allocation" />
                    </SelectTrigger>
                    <SelectContent>
                      {readyAllocations.map((alloc) => (
                        <SelectItem key={alloc.allocation_id} value={alloc.allocation_id.toString()}>
                          Alloc #{alloc.allocation_id} - {alloc.resource} ({alloc.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected_delivery_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> Expected Delivery Date
                  </Label>
                  <Input
                    id="expected_delivery_date"
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    required
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    "Authorize Dispatch"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">In Transit</p>
                <h3 className="text-3xl font-bold mt-1 text-blue-800">{inTransitCount}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-600 uppercase tracking-wider">Confirmed Delivered</p>
                <h3 className="text-3xl font-bold mt-1 text-green-800">{deliveredCount}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold">
            <Truck className="w-5 h-5 text-primary" />
            Active Dispatches Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10 font-bold">
              <TableRow>
                <TableHead className="pl-6 w-32 font-bold">Disp ID</TableHead>
                <TableHead className="font-bold">Shipment Details</TableHead>
                <TableHead className="font-bold">Route</TableHead>
                <TableHead className="font-bold text-center">Dates</TableHead>
                <TableHead className="text-right pr-6 font-bold">Transit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="font-medium">Fetching dispatch cycles...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : dispatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No active shipments in transit.
                  </TableCell>
                </TableRow>
              ) : (
                dispatches.map((d) => (
                  <TableRow key={d.dispatch_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-extrabold text-blue-700">#{d.dispatch_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-blue-500" />
                          {d.resource}
                        </span>
                        <span className="text-xs font-semibold text-green-700 ml-5">
                          {d.quantity?.toLocaleString()} Units
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">From:</span> {d.from_center}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">To:</span> {d.destination_area}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <div className="flex flex-col gap-1 items-center">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-tight">
                          <Calendar className="w-3 h-3" /> Dispatched: {d.dispatch_date ? new Date(d.dispatch_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                          <Calendar className="w-3 h-3" /> ETA: {d.expected_delivery_date ? new Date(d.expected_delivery_date).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge
                        variant={STATUS_VARIANTS[d.status] ?? "secondary"}
                        className={STATUS_COLORS[d.status] ?? ""}
                      >
                        {d.status}
                      </Badge>
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

// Helper icons needed by the UI
function Building2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
