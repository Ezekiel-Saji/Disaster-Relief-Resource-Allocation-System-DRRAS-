"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, PlusCircle, Loader2, Eye, Edit, Trash2 } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface Center {
  center_id: number;
  location: string;
  storage_capacity: number;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newCenter, setNewCenter] = useState({
    location: "",
    storage_capacity: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

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
        .from('relief_centers')
        .insert([
          {
            location: newCenter.location,
            storage_capacity: parseInt(newCenter.storage_capacity) || 0
          }
        ]);

      if (error) throw error;

      await fetchCenters();
      setIsDialogOpen(false);
      setNewCenter({ location: "", storage_capacity: "" });
    } catch (error) {
      console.error("Error adding center:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Relief Centers</h1>
          <p className="text-muted-foreground mt-1">Manage warehouses and supply distribution hubs.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90" />}>
            <PlusCircle className="w-4 h-4" /> Add Relief Center
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register Relief Center</DialogTitle>
              <DialogDescription>
                Add a new distribution hub to the network.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCenter}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location Name</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. North Hub" 
                    value={newCenter.location}
                    onChange={(e) => setNewCenter({...newCenter, location: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Storage Capacity (units)</Label>
                  <Input 
                    id="capacity" 
                    type="number"
                    placeholder="e.g. 5000" 
                    value={newCenter.storage_capacity}
                    onChange={(e) => setNewCenter({...newCenter, storage_capacity: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Register Center"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Registered Centers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-24">ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Storage Capacity (units)</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>Loading centers...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : centers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No relief centers found.
                  </TableCell>
                </TableRow>
              ) : (
                centers.map((center) => (
                  <TableRow key={center.center_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold text-muted-foreground">#{center.center_id}</TableCell>
                    <TableCell className="font-medium">{center.location}</TableCell>
                    <TableCell>{center.storage_capacity.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
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
