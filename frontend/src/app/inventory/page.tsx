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
  Loader2,
  Building2,
  Boxes
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
  center_id: number;
  center: string;
  resource_id: number;
  resource: string;
  unit_of_measurement: string;
  available: number;
  reserved: number;
  dispatchable_quantity: number;
  stock_health_pct: number;
  stock_health_label: string;
}

interface Center {
  center_id: number;
  location: string;
}

interface ResourceType {
  id: number;
  name: string;
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
        .select('*');

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
        supabase.from('v_relief_centers').select('center_id, location'),
        supabase.from('v_lookup_resources').select('id, name')
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
      console.log("Direct table access required for inventory addition (No RPC defined in tech ref)");
      alert("Manual insertion to 'inventory' table required. No fn_add_inventory RPC was defined in technical reference.");
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
      console.log("Direct table access required for inventory update");
      alert("Manual update to 'inventory' table required.");
      setIsEditOpen(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Error updating inventory:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm("Are you sure you want to remove this item from inventory?")) {
      try {
        console.log("Direct table deletion required");
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
      available: item.available.toString(),
      reserved: item.reserved.toString()
    });
    setIsEditOpen(true);
  };

  const getHealthColor = (label: string) => {
    switch (label) {
      case "Critical": return "bg-red-500";
      case "Low": return "bg-orange-500";
      case "Optimal": return "bg-green-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Global Stock Inventory</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time tracking of resource levels with predictive buffer monitoring.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2 shadow-lg font-bold bg-primary hover:bg-primary/90" />}>
            <PlusCircle className="w-4 h-4" /> Add Inventory Entry
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Register New Resource Lot</DialogTitle>
              <DialogDescription>
                Note: This operation currently uses a mock handler as no RPC is defined in the tech reference for inventory management.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="center" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" /> Relief Center Hub
                  </Label>
                  <Select 
                    value={formData.center_id} 
                    onValueChange={(val) => setFormData({...formData, center_id: val || ""})}
                  >
                    <SelectTrigger id="center" className="bg-muted/30">
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
                  <Label htmlFor="resource" className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-muted-foreground" /> Resource Category
                  </Label>
                  <Select 
                    value={formData.resource_id} 
                    onValueChange={(val) => setFormData({...formData, resource_id: val || ""})}
                  >
                    <SelectTrigger id="resource" className="bg-muted/30">
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="available">Available Units</Label>
                    <Input 
                      id="available" 
                      type="number" 
                      value={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.value})}
                      required 
                      className="bg-muted/30 font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reserved">Emergency Buffer</Label>
                    <Input 
                      id="reserved" 
                      type="number" 
                      value={formData.reserved}
                      onChange={(e) => setFormData({...formData, reserved: e.target.value})}
                      required 
                      className="bg-muted/30 font-bold"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Stock Entry
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Available Resources</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-900 font-mono">
                  {inventory.reduce((acc, item) => acc + (item.available || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Reserved Risk Buffer</p>
                <h3 className="text-2xl font-bold mt-1 text-amber-900 font-mono">
                  {inventory.reduce((acc, item) => acc + (item.reserved || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-600 uppercase tracking-wider">Dispatchable Surplus</p>
                <h3 className="text-2xl font-bold mt-1 text-green-900 font-mono">
                  {inventory.reduce((acc, item) => acc + (item.dispatchable_quantity || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold">
            <Package className="w-5 h-5 text-primary" />
            Live Inventory Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10 font-bold">
              <TableRow>
                <TableHead className="pl-6 font-bold text-primary">Center / Hub</TableHead>
                <TableHead className="font-bold">Resource / Unit</TableHead>
                <TableHead className="font-bold text-center">Available</TableHead>
                <TableHead className="font-bold text-center">Reserved</TableHead>
                <TableHead className="font-bold">Dispatchable</TableHead>
                <TableHead className="font-bold">Stock Health</TableHead>
                <TableHead className="text-right pr-6 font-bold">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    Synchronizing Global Stock...
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                    No resources registered in cloud inventory.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={`${item.center_id}-${item.resource_id}`} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold flex items-center gap-2">
                       <Building2 className="w-4 h-4 text-muted-foreground" />
                       {item.center}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className="font-bold bg-primary/5 text-primary border-primary/20 w-fit">{item.resource}</Badge>
                        <span className="text-[10px] text-muted-foreground ml-1 uppercase font-medium">{item.unit_of_measurement}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg text-center">{item.available?.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-center line-through decoration-muted-foreground/30">{item.reserved?.toLocaleString()}</TableCell>
                    <TableCell className="font-extrabold text-blue-700">{item.dispatchable_quantity?.toLocaleString()}</TableCell>
                    <TableCell className="w-[180px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={`${
                            item.stock_health_label === 'Critical' ? 'text-red-500' :
                            item.stock_health_label === 'Low' ? 'text-orange-500' : 'text-green-600'
                          } uppercase`}>{item.stock_health_label}</span>
                          <span className="text-muted-foreground">{Math.round(item.stock_health_pct)}%</span>
                        </div>
                        <Progress 
                          value={item.stock_health_pct} 
                          className={`h-1.5 rounded-full ${
                             item.stock_health_pct < 30 ? "bg-red-100 [&>div]:bg-red-500" :
                             item.stock_health_pct < 60 ? "bg-orange-100 [&>div]:bg-orange-500" :
                             "bg-green-100 [&>div]:bg-green-500"
                          }`} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-primary transition-colors" />}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(item)} className="gap-2 cursor-pointer font-medium">
                            <Edit className="w-4 h-4" /> Edit Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.resource_id)} 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive font-medium"
                          >
                            <Trash2 className="w-4 h-4" /> Remove Lot
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
            <DialogTitle className="text-2xl font-bold tracking-tight">Adjust Stock Levels</DialogTitle>
            <DialogDescription>
              Update the current availability for {currentItem?.resource} at {currentItem?.center}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-available" className="font-bold">Available Qty</Label>
                  <Input 
                    id="edit-available" 
                    type="number" 
                    value={formData.available}
                    onChange={(e) => setFormData({...formData, available: e.target.value})}
                    required 
                    className="bg-muted/30 font-bold"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reserved" className="font-bold">Reserved Buffer</Label>
                  <Input 
                    id="edit-reserved" 
                    type="number" 
                    value={formData.reserved}
                    onChange={(e) => setFormData({...formData, reserved: e.target.value})}
                    required 
                    className="bg-muted/30 font-bold"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary font-bold" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Global Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
