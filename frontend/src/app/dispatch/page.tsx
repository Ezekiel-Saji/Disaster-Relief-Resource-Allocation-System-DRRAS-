"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  PlusCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Package, 
  Calendar,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState([
    { dispatch_id: 201, allocation_id: 1, dispatch_date: "2024-03-07", expected_delivery: "2024-03-08", status: "In Transit" },
    { dispatch_id: 202, allocation_id: 2, dispatch_date: "2024-03-07", expected_delivery: "2024-03-07", status: "Delivered" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentDispatch, setCurrentDispatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    allocation_id: "",
    dispatch_date: "",
    expected_delivery: "",
    status: "Pending"
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newDispatch = {
      dispatch_id: 200 + dispatches.length + 1,
      allocation_id: parseInt(formData.allocation_id) || 0,
      dispatch_date: formData.dispatch_date,
      expected_delivery: formData.expected_delivery,
      status: formData.status
    };
    setDispatches([...dispatches, newDispatch]);
    setIsAddOpen(false);
    setFormData({ allocation_id: "", dispatch_date: "", expected_delivery: "", status: "Pending" });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatches(dispatches.map(d => 
      d.dispatch_id === currentDispatch.dispatch_id 
        ? { 
            ...d, 
            allocation_id: parseInt(formData.allocation_id) || 0,
            dispatch_date: formData.dispatch_date,
            expected_delivery: formData.expected_delivery,
            status: formData.status
          } 
        : d
    ));
    setIsEditOpen(false);
    setCurrentDispatch(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this dispatch record?")) {
      setDispatches(dispatches.filter(d => d.dispatch_id !== id));
    }
  };

  const openEdit = (dispatch: any) => {
    setCurrentDispatch(dispatch);
    setFormData({
      allocation_id: dispatch.allocation_id.toString(),
      dispatch_date: dispatch.dispatch_date,
      expected_delivery: dispatch.expected_delivery,
      status: dispatch.status
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary px-0">Dispatch Tracking</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time status of resource shipments from hub to field officers.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button className="gap-2 bg-primary hover:bg-primary/90 transition-all shadow-md">
              <PlusCircle className="w-4 h-4" /> Initiate New Dispatch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Resource Dispatch</DialogTitle>
              <DialogDescription>
                Assign a shipment tracker to a verified allocation for ground delivery.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="allocation_id">Allocation reference ID</Label>
                  <Input 
                    id="allocation_id" 
                    type="number" 
                    placeholder="e.g. 1" 
                    value={formData.allocation_id}
                    onChange={(e) => setFormData({...formData, allocation_id: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, dispatch_date: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expected_delivery">Exp. Delivery</Label>
                    <Input 
                      id="expected_delivery" 
                      type="date" 
                      value={formData.expected_delivery}
                      onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val: string) => setFormData({...formData, status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Dispatch Resources</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Truck className="w-5 h-5 text-primary" /> Active Dispatches Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 font-bold w-32 text-primary">Disp. ID</TableHead>
                <TableHead className="font-bold">Alloc. ID</TableHead>
                <TableHead className="font-bold">Dispatch Date</TableHead>
                <TableHead className="font-bold">Exp. Delivery</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatches.map((dispatch) => (
                <TableRow key={dispatch.dispatch_id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-bold">#{dispatch.dispatch_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 font-medium border-primary/20">
                      <Package className="w-3 h-3" /> Alloc #{dispatch.allocation_id}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2 py-4 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {dispatch.dispatch_date}
                  </TableCell>
                  <TableCell className="font-medium">{dispatch.expected_delivery}</TableCell>
                  <TableCell>
                    <Badge variant={
                      dispatch.status === "Delivered" ? "secondary" : 
                      dispatch.status === "In Transit" ? "default" : "outline"
                    } className={
                      dispatch.status === "Delivered" ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" :
                      dispatch.status === "In Transit" ? "bg-blue-500 hover:bg-blue-600 shadow-sm" : ""
                    }>
                      {dispatch.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(dispatch)} className="gap-2 cursor-pointer">
                          <Edit className="w-4 h-4" /> Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(dispatch.dispatch_id)} 
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Tracker
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[300px] flex items-center justify-center border-dashed border-2 bg-muted/5">
          <CardContent className="text-center">
            <Navigation className="w-12 h-12 text-muted-foreground/20 mx-auto" />
            <p className="text-muted-foreground mt-2 font-medium">Live Route Mapping Placeholder</p>
            <p className="text-xs text-muted-foreground/60">GPS data will appear here for in-transit shipments</p>
          </CardContent>
        </Card>
        <Card className="min-h-[300px] bg-primary/5 border-none p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Recent Delivery Insights</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-1.5 h-10 bg-green-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm font-bold">Shipment #20{i} Delivered Successfully</p>
                  <p className="text-xs text-muted-foreground">Arrived at South Ridge camp 2 hours ago. Resources verified by DMO.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Dispatch Status</DialogTitle>
            <DialogDescription>
              Modify delivery details for Tracker ID #{currentDispatch?.dispatch_id}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-allocation_id">Allocation ID</Label>
                <Input 
                  id="edit-allocation_id" 
                  value={formData.allocation_id}
                  onChange={(e) => setFormData({...formData, allocation_id: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dispatch_date">Dispatch Date</Label>
                  <Input 
                    id="edit-dispatch_date" 
                    type="date" 
                    value={formData.dispatch_date}
                    onChange={(e) => setFormData({...formData, dispatch_date: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expected_delivery">Exp. Delivery</Label>
                  <Input 
                    id="edit-expected_delivery" 
                    type="date" 
                    value={formData.expected_delivery}
                    onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Shipment Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val: string) => setFormData({...formData, status: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Update Tracker</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
