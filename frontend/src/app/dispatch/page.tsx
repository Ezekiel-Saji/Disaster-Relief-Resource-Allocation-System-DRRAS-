"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, PlusCircle, Calendar, Hash, Loader2 } from "lucide-react";
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

interface Dispatch {
  dispatch_id: number;
  dispatch_date: string;
  expected_delivery_date: string | null;
  status: string;
  allocation_id: number;
}

const STATUS_VARIANTS: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
  "In Transit": "outline",
  "Delivered": "default",
  "Pending": "secondary",
  "Delayed": "outline",
};

const STATUS_COLORS: Record<string, string> = {
  "In Transit": "border-blue-500 text-blue-600",
  "Delivered": "bg-green-500 hover:bg-green-600 text-white",
  "Pending": "",
  "Delayed": "border-red-400 text-red-600",
};

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    allocation_id: "",
    dispatch_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchDispatches();
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc(
        "fn_create_dispatch",
        {
          p_allocation_id: parseInt(formData.allocation_id),
          p_expected_delivery: formData.expected_delivery_date || null
        }
      );

      if (error) throw error;

    await fetchDispatches();

    setIsOpen(false);
    setFormData({
      allocation_id: "",
      dispatch_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: "",
      status: "Pending",
    });

  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
  } finally {
    setSubmitting(false);
  }
};

  const inTransit = dispatches.filter((d) => d.status === "In Transit").length;
  const delivered = dispatches.filter((d) => d.status === "Delivered").length;
  const pending = dispatches.filter((d) => d.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dispatch Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor outgoing resource dispatches linked to allocations.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90" />}>
            <PlusCircle className="w-4 h-4" /> New Dispatch
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Dispatch Order</DialogTitle>
              <DialogDescription>
                Link a dispatch to an existing allocation and set its delivery timeline.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="allocation_id" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> Allocation ID
                  </Label>
                  <Input
                    id="allocation_id"
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.allocation_id}
                    onChange={(e) => setFormData({ ...formData, allocation_id: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dispatch_date">Dispatch Date</Label>
                    <Input
                      id="dispatch_date"
                      type="date"
                      value={formData.dispatch_date}
                      onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expected_delivery_date">Expected Delivery</Label>
                    <Input
                      id="expected_delivery_date"
                      type="date"
                      value={formData.expected_delivery_date}
                      onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val ?? "Pending" })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Dispatch"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-500/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">{inTransit}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{delivered}</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Truck className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold mt-1">{pending}</h3>
              </div>
              <div className="p-2 bg-muted rounded-full">
                <Truck className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Dispatch Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-32">Dispatch ID</TableHead>
                <TableHead>Allocation ID</TableHead>
                <TableHead>Dispatch Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>Loading dispatches...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : dispatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No dispatches found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                dispatches.map((d) => (
                  <TableRow key={d.dispatch_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold text-primary">#{d.dispatch_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Hash className="w-3 h-3" /> Alloc #{d.allocation_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> {d.dispatch_date}
                      </span>
                    </TableCell>
                    <TableCell>
                      {d.expected_delivery_date ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" /> {d.expected_delivery_date}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">—</span>
                      )}
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
