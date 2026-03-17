"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Package, 
  MoreVertical, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface InventoryItem {
  id: number;
  center_id: number;
  resource_id: number;
  location: string;
  resource_name: string;
  available_quantity: number;
  reserved_buffer_quantity: number;
  trend?: "up" | "down" | "stable";
}

interface Center {
  center_id: number;
  location: string;
}

interface ResourceType {
  resource_id: number;
  resource_name: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    center_id: "",
    resource_id: "",
    available: "",
    reserved: ""
  });

  useEffect(() => {
    fetchInventory();
    fetchMetadata();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_inventory')
        .select('*')
        // .order('id', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const [{ data: centerData }, { data: resourceData }] = await Promise.all([
        supabase.from('relief_centers').select('center_id, location').order('location'),
        supabase.from('resource_types').select('resource_id, resource_name').order('resource_name')
      ]);
      setCenters(centerData || []);
      setResources(resourceData || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Temporarily disabling mutation operations
      console.log("Adding inventory (Simulated):", formData);
      /*
      const { error } = await supabase
        .from('inventory')
        .insert([
          {
            center_id: parseInt(formData.center_id),
            resource_id: parseInt(formData.resource_id),
            available_quantity: parseInt(formData.available) || 0,
            reserved_buffer_quantity: parseInt(formData.reserved) || 0,
          }
        ]);

      if (error) throw error;
      await fetchInventory();
      */
      
      setIsAddOpen(false);
      setFormData({ center_id: "", resource_id: "", available: "", reserved: "" });
    } catch (error) {
      console.error("Error adding inventory:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;
    setSubmitting(true);
    try {
      // Temporarily disabling mutation operations
      console.log("Updating inventory (Simulated):", currentItem.id, formData);
      /*
      const { error } = await supabase
        .from('inventory')
        .update({
          center_id: parseInt(formData.center_id),
          resource_id: parseInt(formData.resource_id),
          available_quantity: parseInt(formData.available) || 0,
          reserved_buffer_quantity: parseInt(formData.reserved) || 0,
        })
        .eq('id', currentItem.id);

      if (error) throw error;
      await fetchInventory();
      */

      setIsEditOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Error updating inventory:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this item from inventory?")) {
      try {
        // Temporarily disabling mutation operations
        console.log("Deleting inventory (Simulated):", id);
        /*
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
        setInventory(prev => prev.filter(item => item.id !== id));
        */
      } catch (error) {
        console.error("Error deleting inventory:", error);
      }
    }
  };

  const openEdit = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({
      center_id: item.center_id.toString(),
      resource_id: item.resource_id.toString(),
      available: item.available_quantity.toString(),
      reserved: item.reserved_buffer_quantity.toString()
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Inventory Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time tracking and control of resource levels across centers.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all" />}>
            <PlusCircle className="w-4 h-4" /> Add Inventory Item
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Resource</DialogTitle>
              <DialogDescription>
                Add a new resource type or stock entry to a relief center hub.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="center">Relief Center</Label>
                  <Select 
                    value={formData.center_id} 
                    onValueChange={(val) => setFormData({...formData, center_id: val || ""})}
                  >
                    <SelectTrigger id="center">
                      <SelectValue placeholder="Select a center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((c) => (
                        <SelectItem key={c.center_id} value={c.center_id.toString()}>
                          {c.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource Name</Label>
                  <Select 
                    value={formData.resource_id} 
                    onValueChange={(val) => setFormData({...formData, resource_id: val || ""})}
                  >
                    <SelectTrigger id="resource">
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((r) => (
                        <SelectItem key={r.resource_id} value={r.resource_id.toString()}>
                          {r.resource_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="available">Available Qty</Label>
                    <Input 
                      id="available" 
                      type="number" 
                      value={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reserved">Reserved Buffer</Label>
                    <Input 
                      id="reserved" 
                      type="number" 
                      value={formData.reserved}
                      onChange={(e) => setFormData({...formData, reserved: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Stock Entry
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resources</p>
                <h3 className="text-2xl font-bold mt-1">
                  {inventory.reduce((acc, item) => acc + (item.available_quantity || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buffered Stock</p>
                <h3 className="text-2xl font-bold mt-1">
                  {inventory.reduce((acc, item) => acc + (item.reserved_buffer_quantity || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Health</p>
                <h3 className="text-2xl font-bold mt-1">94.2%</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Global Stock Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6">Center</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Stock Health</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading Global Inventory...
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No resources found in current stock registry.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6">
                      <div className="font-semibold">{item.location}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">{item.resource_name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-lg">{(item.available_quantity ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{(item.reserved_buffer_quantity ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium">
                          {(() => {
                            const available = item.available_quantity ?? 0;
                            const reserved = item.reserved_buffer_quantity ?? 0;
                            const total = available + reserved;
                            const percentage = total > 0 ? (available / total) * 100 : 0;
                            return (
                              <>
                                <span>{Math.round(percentage)}%</span>
                                <span className="text-muted-foreground">Optimal</span>
                              </>
                            );
                          })()}
                        </div>
                        {(() => {
                          const available = item.available_quantity ?? 0;
                          const reserved = item.reserved_buffer_quantity ?? 0;
                          const total = available + reserved;
                          const percentage = total > 0 ? (available / total) * 100 : 0;
                          return (
                            <Progress 
                              value={percentage} 
                              className={`h-1.5 ${
                                percentage < 30 ? "bg-red-100 [&>div]:bg-red-500" :
                                percentage < 60 ? "bg-yellow-100 [&>div]:bg-yellow-500" :
                                "bg-primary/10 [&>div]:bg-primary"
                              }`} 
                            />
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : item.trend === "down" ? (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      ) : (
                        <span className="text-muted-foreground w-4 h-4 flex items-center justify-center">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(item)} className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4" /> Edit Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.id)} 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" /> Remove Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
            <DialogDescription>
              Modify the current stock levels for {currentItem?.resource_name} at {currentItem?.location}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-center">Relief Center</Label>
                <Select 
                  value={formData.center_id} 
                  onValueChange={(val) => setFormData({...formData, center_id: val || ""})}
                >
                  <SelectTrigger id="edit-center">
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((c) => (
                      <SelectItem key={c.center_id} value={c.center_id.toString()}>
                        {c.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-resource">Resource Name</Label>
                <Select 
                  value={formData.resource_id} 
                  onValueChange={(val) => setFormData({...formData, resource_id: val || ""})}
                >
                  <SelectTrigger id="edit-resource">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((r) => (
                      <SelectItem key={r.resource_id} value={r.resource_id.toString()}>
                        {r.resource_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-available">Available Qty</Label>
                  <Input 
                    id="edit-available" 
                    type="number" 
                    value={formData.available}
                    onChange={(e) => setFormData({...formData, available: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reserved">Reserved Buffer</Label>
                  <Input 
                    id="edit-reserved" 
                    type="number" 
                    value={formData.reserved}
                    onChange={(e) => setFormData({...formData, reserved: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
