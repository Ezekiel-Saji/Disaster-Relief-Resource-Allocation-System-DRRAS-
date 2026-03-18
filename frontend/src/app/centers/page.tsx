"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, PlusCircle, Loader2, Eye, Edit, Trash2, Warehouse, MapPin, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface Center {
  center_id: number;
  name?: string;
  location: string;
  storage_capacity: number;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newCenter, setNewCenter] = useState({
    name: "",
    location: "",
    storage_capacity: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const formatSupabaseError = (error: any) => {
    if (!error) return "Unknown error";
    const parts = [
      error.message,
      error.details,
      error.hint,
      error.code ? `code: ${error.code}` : undefined,
    ].filter(Boolean);
    return parts.join(" | ");
  };

  const isMissingColumnError = (error: any, column: string) => {
    if (!error) return false;
    const message = String(error.message || "").toLowerCase();
    return (
      message.includes(`could not find the '${column}' column`) ||
      message.includes(`could not find column \"${column}\"`) ||
      message.includes(`column \"${column}\" does not exist`)
    );
  };

  async function fetchCenters() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_relief_centers')
        .select('*')
        .order('center_id', { ascending: true });

      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('relief_center') // Base table name from reference
        .insert([
          {
            name: newCenter.name,
            location: newCenter.location,
            storage_capacity: parseInt(newCenter.storage_capacity) || 0,
          },
        ]);

      if (error) throw error;

      await fetchCenters();
      setIsDialogOpen(false);
      setNewCenter({ location: "", storage_capacity: "" });
    } catch (error: any) {
      console.error("Error adding center:", error);

      // Supabase/PostgREST caches schema metadata. When the schema changes (e.g., a new
      // column is added), PostgREST may return PGRST204 until the cache is reloaded.
      // This retry attempt will refresh the schema and retry once.
      const isSchemaCacheError =
        error?.code === "PGRST204" ||
        String(error?.message || "").includes("PGRST204");

      if (isSchemaCacheError) {
        console.info("Detected schema cache error; reloading PostgREST schema and retrying...");
        try {
          await supabase.rpc("postgrest_reload_schema");
          const { error: retryError } = await supabase
            .from("relief_center")
            .insert([
              {
                name: newCenter.name,
                location: newCenter.location,
                storage_capacity: parseInt(newCenter.storage_capacity) || 0,
              },
            ]);

          if (retryError) throw retryError;

          await fetchCenters();
          setIsDialogOpen(false);
          setNewCenter({ location: "", storage_capacity: "" });
          return;
        } catch (retryError: any) {
          console.error("Retry failed after schema reload:", retryError);
          alert(
            `Failed to register relief center. ${formatSupabaseError(retryError)}`
          );
          return;
        }
      }

      if (isMissingColumnError(error, "name")) {
        console.info("Detected missing 'name' column; retrying insert without it...");
        try {
          const { error: retryError } = await supabase
            .from("relief_center")
            .insert([
              {
                location: newCenter.location,
                storage_capacity: parseInt(newCenter.storage_capacity) || 0,
              },
            ]);

          if (retryError) throw retryError;

          await fetchCenters();
          setIsDialogOpen(false);
          setNewCenter({ location: "", storage_capacity: "" });
          return;
        } catch (retryError: any) {
          console.error("Retry failed after missing column fallback:", retryError);
          alert(
            `Failed to register relief center. ${formatSupabaseError(retryError)}`
          );
          return;
        }
      }

      alert(
        `Failed to register relief center. ${formatSupabaseError(error)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetDialogState = () => {
    setSelectedCenter(null);
    setNewCenter({ name: "", location: "", storage_capacity: "" });
    setDialogMode("add");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  const openAddDialog = () => {
    resetDialogState();
    setDialogMode("add");
    setIsDialogOpen(true);
  };

  const openViewDialog = (center: Center) => {
    setSelectedCenter(center);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const openEditDialog = (center: Center) => {
    setSelectedCenter(center);
    setNewCenter({
      name: center.name ?? center.location,
      location: center.location,
      storage_capacity: String(center.storage_capacity),
    });
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleUpdateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('relief_center')
        .update({
          name: newCenter.name,
          location: newCenter.location,
          storage_capacity: parseInt(newCenter.storage_capacity) || 0,
        })
        .eq('center_id', selectedCenter.center_id);

      if (error) throw error;

      await fetchCenters();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating center:", error);

      const isSchemaCacheError =
        error?.code === "PGRST204" ||
        String(error?.message || "").includes("PGRST204");

      if (isSchemaCacheError) {
        console.info("Detected schema cache error; reloading PostgREST schema and retrying...");
        try {
          await supabase.rpc("postgrest_reload_schema");
          const { error: retryError } = await supabase
            .from("relief_center")
            .update({
              name: newCenter.name,
              location: newCenter.location,
              storage_capacity: parseInt(newCenter.storage_capacity) || 0,
            })
            .eq("center_id", selectedCenter.center_id);

          if (retryError) throw retryError;

          await fetchCenters();
          setIsDialogOpen(false);
          return;
        } catch (retryError: any) {
          console.error("Retry failed after schema reload:", retryError);
          alert(
            `Failed to update relief center. ${formatSupabaseError(retryError)}`
          );
          return;
        }
      }

      if (isMissingColumnError(error, "name")) {
        console.info("Detected missing 'name' column; retrying update without it...");
        try {
          const { error: retryError } = await supabase
            .from("relief_center")
            .update({
              location: newCenter.location,
              storage_capacity: parseInt(newCenter.storage_capacity) || 0,
            })
            .eq("center_id", selectedCenter.center_id);

          if (retryError) throw retryError;

          await fetchCenters();
          setIsDialogOpen(false);
          return;
        } catch (retryError: any) {
          console.error("Retry failed after missing column fallback:", retryError);
          alert(
            `Failed to update relief center. ${formatSupabaseError(retryError)}`
          );
          return;
        }
      }

      alert(
        `Failed to update relief center. ${formatSupabaseError(error)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCenter = async (center: Center) => {
    const confirmed = window.confirm(
      `Delete hub "${center.location}" (ID: ${center.center_id})? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('relief_center')
        .delete()
        .eq('center_id', center.center_id);

      if (error) throw error;
      await fetchCenters();
    } catch (error: any) {
      console.error("Error deleting center:", error);
      alert(`Failed to delete relief center. ${formatSupabaseError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Relief Center Network</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Strategic distribution hubs and warehouse infrastructure management.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger render={
            <Button className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-lg" onClick={openAddDialog}>
              <PlusCircle className="w-4 h-4" /> Register New Center
            </Button>
          }>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {dialogMode === "view" ? "Hub Details" : dialogMode === "edit" ? "Update Hub Details" : "Expand Logistics Network"}
              </DialogTitle>
              <DialogDescription className="font-medium">
                {dialogMode === "view"
                  ? "Review the hub information below. Use edit to make changes."
                  : dialogMode === "edit"
                  ? "Update the hub configuration. Changes will persist to the database."
                  : "Add a new distribution hub to the network to increase storage capacity."}
              </DialogDescription>
            </DialogHeader>

            {dialogMode === "view" ? (
              <div className="space-y-4 py-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hub ID</p>
                  <p className="font-semibold text-slate-800">#{selectedCenter?.center_id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name / Location</p>
                  <p className="font-semibold text-slate-800">{selectedCenter?.name ?? selectedCenter?.location}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Storage Capacity</p>
                  <p className="font-semibold text-slate-800">{selectedCenter?.storage_capacity.toLocaleString()} units</p>
                </div>
              </div>
            ) : (
              <form onSubmit={dialogMode === "edit" ? handleUpdateCenter : handleAddCenter}>
                <div className="grid gap-4 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" /> Hub Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. North Logistics Hub"
                      value={newCenter.name}
                      onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                      required
                      className="bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. South Sector Warehouse, Central Hub"
                      value={newCenter.location}
                      onChange={(e) => setNewCenter({ ...newCenter, location: e.target.value })}
                      required
                      className="bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity" className="font-bold flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-primary" /> Storage Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Total units (e.g. 5000)"
                      value={newCenter.storage_capacity}
                      onChange={(e) => setNewCenter({ ...newCenter, storage_capacity: e.target.value })}
                      required
                      className="bg-muted/30 font-semibold"
                    />
                    <p className="text-[10px] text-muted-foreground italic font-medium">Specify the total volumetric capacity in standard relief units.</p>
                  </div>
                </div>
                <DialogFooter className="bg-muted/20 p-4 -mx-6 -mb-6 border-t">
                  <Button type="submit" className="w-full font-bold h-11" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {dialogMode === "edit" ? "Saving changes..." : "Provisioning..."}
                      </>
                    ) : dialogMode === "edit" ? (
                      "Save Changes"
                    ) : (
                      "Authorize Hub Registration"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {dialogMode === "view" && (
              <DialogFooter className="bg-muted/20 p-4 -mx-6 -mb-6 border-t">
                <Button className="w-full font-bold h-11" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-primary/5 border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Hubs</p>
                <h3 className="text-2xl font-black text-primary">{centers.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-blue-50/50 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Warehouse className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Capacity</p>
                <h3 className="text-2xl font-black text-blue-600">
                  {centers.reduce((acc, curr) => acc + curr.storage_capacity, 0).toLocaleString()} <span className="text-xs font-medium">units</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-slate-50 border-l-4 border-l-slate-400">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-200 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Capacity</p>
                <h3 className="text-2xl font-black text-slate-700">
                  {centers.length > 0 
                    ? Math.round(centers.reduce((acc, curr) => acc + curr.storage_capacity, 0) / centers.length).toLocaleString()
                    : 0
                  }
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-2xl border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold uppercase tracking-wider text-primary">
            <Warehouse className="w-5 h-5 text-primary fill-primary/10" />
            Registered Infrastructure Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent text-xs uppercase font-bold tracking-tight">
                <TableHead className="pl-6 w-24">Asset ID</TableHead>
                <TableHead>Hub Name / Location</TableHead>
                <TableHead>Storage Capacity (Units)</TableHead>
                <TableHead className="text-right pr-6">Operational Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                      <p className="font-mono text-xs tracking-widest uppercase">Syncing with Logistic DB...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : centers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic font-medium">
                    No active infrastructure assets detected in v_relief_centers ledger.
                  </TableCell>
                </TableRow>
              ) : (
                centers.map((center) => (
                  <TableRow key={center.center_id} className="hover:bg-muted/5 transition-all group border-b last:border-0">
                    <TableCell className="pl-6 font-bold text-muted-foreground font-mono">
                      <Badge variant="outline" className="text-[10px] bg-muted/20 border-none">#{center.center_id}</Badge>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-800 tracking-tight">
                      {center.name ?? center.location}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-700">{center.storage_capacity.toLocaleString()}</span>
                        <div className="hidden sm:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${Math.min((center.storage_capacity / 10000) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                          onClick={() => openViewDialog(center)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                          onClick={() => openEditDialog(center)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCenter(center)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
