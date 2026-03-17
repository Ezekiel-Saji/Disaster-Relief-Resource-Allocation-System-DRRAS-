"use client";

import { useState } from "react";
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
  ArrowDownRight
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

export default function InventoryPage() {
  const [inventory, setInventory] = useState([
    { id: 1, center: "North Hub", resource: "Food Kits", available: 1200, reserved: 200, trend: "up" },
    { id: 2, center: "North Hub", resource: "Water Pallets", available: 500, reserved: 50, trend: "down" },
    { id: 3, center: "South Central", resource: "Medical Supplies", available: 2500, reserved: 800, trend: "stable" },
    { id: 4, center: "East Port", resource: "Tents", available: 300, reserved: 100, trend: "up" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    center: "",
    resource: "",
    available: "",
    reserved: ""
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: inventory.length + 1,
      center: formData.center,
      resource: formData.resource,
      available: parseInt(formData.available) || 0,
      reserved: parseInt(formData.reserved) || 0,
      trend: "stable"
    };
    setInventory([...inventory, newItem]);
    setIsAddOpen(false);
    setFormData({ center: "", resource: "", available: "", reserved: "" });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setInventory(inventory.map(item => 
      item.id === currentItem.id 
        ? { 
            ...item, 
            center: formData.center, 
            resource: formData.resource, 
            available: parseInt(formData.available) || 0, 
            reserved: parseInt(formData.reserved) || 0 
          } 
        : item
    ));
    setIsEditOpen(false);
    setCurrentItem(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this item from inventory?")) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const openEdit = (item: any) => {
    setCurrentItem(item);
    setFormData({
      center: item.center,
      resource: item.resource,
      available: item.available.toString(),
      reserved: item.reserved.toString()
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
                  <Input 
                    id="center" 
                    placeholder="e.g. North Hub" 
                    value={formData.center}
                    onChange={(e) => setFormData({...formData, center: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource Name</Label>
                  <Input 
                    id="resource" 
                    placeholder="e.g. Food Kits" 
                    value={formData.resource}
                    onChange={(e) => setFormData({...formData, resource: e.target.value})}
                    required 
                  />
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
                <Button type="submit" className="w-full">Confirm Stock Entry</Button>
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
                  {inventory.reduce((acc, item) => acc + item.available, 0).toLocaleString()}
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
                  {inventory.reduce((acc, item) => acc + item.reserved, 0).toLocaleString()}
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
              {inventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6">
                    <div className="font-semibold">{item.center}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">{item.resource}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-lg">{item.available.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{item.reserved.toLocaleString()}</TableCell>
                  <TableCell className="w-[180px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-medium">
                        <span>{Math.round((item.available / (item.available + item.reserved)) * 100)}%</span>
                        <span className="text-muted-foreground">Optimal</span>
                      </div>
                      <Progress 
                        value={(item.available / (item.available + item.reserved)) * 100} 
                        className={`h-1.5 ${
                          (item.available / (item.available + item.reserved)) < 0.3 ? "bg-red-100 [&>div]:bg-red-500" :
                          (item.available / (item.available + item.reserved)) < 0.6 ? "bg-yellow-100 [&>div]:bg-yellow-500" :
                          "bg-primary/10 [&>div]:bg-primary"
                        }`} 
                      />
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
            <DialogDescription>
              Modify the current stock levels for {currentItem?.resource} at {currentItem?.center}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-center">Relief Center</Label>
                <Input 
                  id="edit-center" 
                  value={formData.center}
                  onChange={(e) => setFormData({...formData, center: e.target.value})}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-resource">Resource Name</Label>
                <Input 
                  id="edit-resource" 
                  value={formData.resource}
                  onChange={(e) => setFormData({...formData, resource: e.target.value})}
                  required 
                />
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
              <Button type="submit" className="w-full">Update Inventory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
