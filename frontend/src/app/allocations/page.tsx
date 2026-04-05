"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  PackageMinus, 
  Calendar,
  Building2,
  Hash,
  Loader2,
  AlertCircle
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { triggerInAppNotification } from "@/lib/page-notifications";

interface Allocation {
  allocation_id: number;
  request_id: number;
  requested_by: string;
  resource: string;
  source_center: string;
  center_id: number;
  quantity: number;
  date: string;
  request_status: string;
}

interface PendingRequest {
  request_id: number;
  area: string;
  resource: string;
  resource_id: number;
}

interface ReliefCenter {
  center_id: number;
  location: string | null;
  name: string | null;
}

interface InventoryAvailability {
  center_id: number;
  resource_id: number;
  dispatchable_quantity: number | null;
}

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [centers, setCenters] = useState<ReliefCenter[]>([]);
  const [inventory, setInventory] = useState<InventoryAvailability[]>([]);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    request_id: "",
    center_id: "",
    quantity: ""
  });

  const selectedRequest = pendingRequests.find(
    (req) => req.request_id?.toString() === formData.request_id
  );

  const selectedInventory = inventory.find(
    (item) =>
      item.center_id?.toString() === formData.center_id &&
      item.resource_id === selectedRequest?.resource_id
  );

  const maxDispatchable =
    typeof selectedInventory?.dispatchable_quantity === "number"
      ? selectedInventory.dispatchable_quantity
      : undefined;

  useEffect(() => {
    fetchAllocations();
    fetchMetadata();
  }, []);

  async function fetchAllocations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_allocations')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const [
        { data: requestsData, error: reqError },
        { data: centersData },
        { data: inventoryData, error: inventoryError },
      ] = await Promise.all([
        supabase
          .from('v_area_requests')
          .select('*')
          .in('status', ['Pending', 'Approved'])
          .order('request_id', { ascending: false }),
        supabase
          .from('relief_center')
          .select('center_id, location, name'),
        supabase
          .from('v_inventory')
          .select('center_id, resource_id, dispatchable_quantity'),
      ]);

      if (reqError) console.error('[Allocations] pending requests error:', reqError);
      if (inventoryError) console.error('[Allocations] inventory error:', inventoryError);
        
      const uniqueRequests = Array.from(
        new Map((requestsData || []).map((req) => [req.request_id, req])).values()
      );

      setPendingRequests(uniqueRequests);
      setCenters(centersData || []);
      setInventory(inventoryData || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
  }

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAllocationError(null);
    
    try {
      const { error } = await supabase.rpc('fn_process_allocation', {
        p_request_id: parseInt(formData.request_id),
        p_center_id: parseInt(formData.center_id),
        p_quantity: parseInt(formData.quantity)
      });

      if (error) throw error;

      await fetchAllocations();
      setIsAddOpen(false);
      setFormData({ request_id: "", center_id: "", quantity: "" });
      setAllocationError(null);
      triggerInAppNotification({
        page: "/allocations",
        title: "Allocation authorized",
        message: "Resource allocation has been authorized successfully. Dispatch processing may now proceed.",
        type: "Info",
      });
    } catch (error: unknown) {
      console.log(JSON.stringify(error, null, 2));
      // Surface the trigger's error message directly in the dialog
      const raw =
        error && typeof error === "object"
          ? ("message" in error && typeof error.message === "string" && error.message) ||
            ("details" in error && typeof error.details === "string" && error.details) ||
            "Failed to authorize allocation."
          : "Failed to authorize allocation.";
      // Trim the technical prefix Postgres adds (e.g. "ERROR: ", "PGRST116: ")
      const clean = raw.replace(/^(ERROR|PGRST\w+):\s*/i, "");
      setAllocationError(clean);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Resource Allocations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and assign resource stocks to pending area requests.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md font-bold" />}>
            <PlusCircle className="w-4 h-4" /> Create New Allocation
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">New Resource Allocation</DialogTitle>
              <DialogDescription>
                Allocate stock from a relief center to a specific ground request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAuthorize}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="request_id" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> Select Request
                  </Label>
                  <Select 
                    value={formData.request_id} 
                    onValueChange={(val) => setFormData({ request_id: val ?? "", center_id: "", quantity: "" })}
                  >
                    <SelectTrigger id="request_id" className="bg-muted/30">
                      <SelectValue placeholder="Identify Request" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingRequests.map((req) => (
                        <SelectItem key={req.request_id} value={req.request_id?.toString() ?? ""}>
                          #{req.request_id} - {req.area} ({req.resource})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="center_id" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" /> Relief Center Source
                  </Label>
                  <Select 
                    value={formData.center_id} 
                    onValueChange={(val) => setFormData({...formData, center_id: val ?? ""})}
                  >
                    <SelectTrigger id="center_id" className="bg-muted/30">
                      <SelectValue placeholder="Choose Hub" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.center_id} value={center.center_id?.toString() ?? ""}>
                          {center.location || center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="flex items-center gap-2">
                    <PackageMinus className="w-4 h-4 text-muted-foreground" /> Quantity Allocated
                  </Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder={maxDispatchable !== undefined ? `Max: ${maxDispatchable}` : "e.g. 100"}
                    value={formData.quantity}
                    min={1}
                    max={maxDispatchable}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required 
                    disabled={!formData.center_id}
                    className="bg-muted/30 font-medium"
                  />
                  {maxDispatchable !== undefined && (
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Max dispatchable: <span className="font-black text-primary">{maxDispatchable}</span> units
                      {selectedRequest && <> of {selectedRequest.resource}</>}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Authorize Allocation
                </Button>
              </DialogFooter>
              {allocationError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold text-destructive leading-snug">{allocationError}</p>
                </div>
              )}
            </form>
          </DialogContent>

        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold">
            <PackageMinus className="w-5 h-5 text-primary" />
            Allocation Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10 font-bold">
              <TableRow>
                <TableHead className="pl-6 w-32 font-bold">Alloc ID</TableHead>
                <TableHead className="font-bold">Requirement</TableHead>
                <TableHead className="font-bold">Fulfillment Source</TableHead>
                <TableHead className="font-bold text-center">Allocated Qty</TableHead>
                <TableHead className="font-bold text-right pr-6">Date Authorized</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading Allocations...
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No resource allocations authorized yet.
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((alloc) => (
                  <TableRow key={alloc.allocation_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold text-primary">#{alloc.allocation_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1.5 font-medium border-primary/20 bg-primary/5 text-primary">
                            <Hash className="w-3 h-3" /> Req #{alloc.request_id}
                          </Badge>
                          <span className="font-bold text-sm">{alloc.resource}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">For {alloc.requested_by}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        {alloc.source_center}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-base text-green-700 text-center">
                      {alloc.quantity?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2 text-muted-foreground italic">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {alloc.date ? new Date(alloc.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {!loading && allocations.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold">Allocation Processing Information</p>
            <p className="mt-0.5">These records represent authorized resource movements. Once allocated, items are subtracted from center inventory and earmarked for dispatch.</p>
          </div>
        </div>
      )}
    </div>
  );
}
