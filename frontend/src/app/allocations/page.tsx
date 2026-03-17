"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  PlusCircle, 
  PackageMinus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Calendar,
  Building2,
  Hash
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

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState([
    { allocation_id: 1, request_id: 102, center: "South Central", quantity: 200, date: "2024-03-07" },
    { allocation_id: 2, request_id: 103, center: "North Hub", quantity: 50, date: "2024-03-07" },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentAlloc, setCurrentAlloc] = useState<any>(null);
  const [formData, setFormData] = useState({
    request_id: "",
    center: "",
    quantity: ""
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlloc = {
      allocation_id: allocations.length + 1,
      request_id: parseInt(formData.request_id) || 0,
      center: formData.center,
      quantity: parseInt(formData.quantity) || 0,
      date: new Date().toISOString().split('T')[0]
    };
    setAllocations([...allocations, newAlloc]);
    setIsAddOpen(false);
    setFormData({ request_id: "", center: "", quantity: "" });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setAllocations(allocations.map(alloc => 
      alloc.allocation_id === currentAlloc.allocation_id 
        ? { 
            ...alloc, 
            request_id: parseInt(formData.request_id) || 0,
            center: formData.center,
            quantity: parseInt(formData.quantity) || 0
          } 
        : alloc
    ));
    setIsEditOpen(false);
    setCurrentAlloc(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this allocation?")) {
      setAllocations(allocations.filter(alloc => alloc.allocation_id !== id));
    }
  };

  const openEdit = (alloc: any) => {
    setCurrentAlloc(alloc);
    setFormData({
      request_id: alloc.request_id.toString(),
      center: alloc.center,
      quantity: alloc.quantity.toString()
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Resource Allocations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and assign resource stocks to pending area requests.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md" />}>
            <PlusCircle className="w-4 h-4" /> Create New Allocation
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Resource Allocation</DialogTitle>
              <DialogDescription>
                Allocate stock from a relief center to a specific ground request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="request_id" className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" /> Request ID
                  </Label>
                  <Input 
                    id="request_id" 
                    type="number" 
                    placeholder="e.g. 102" 
                    value={formData.request_id}
                    onChange={(e) => setFormData({...formData, request_id: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="center" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" /> Relief Center Source
                  </Label>
                  <Input 
                    id="center" 
                    placeholder="e.g. South Central Hub" 
                    value={formData.center}
                    onChange={(e) => setFormData({...formData, center: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="flex items-center gap-2">
                    <PackageMinus className="w-4 h-4 text-muted-foreground" /> Quantity Allocated
                  </Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Authorize Allocation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <PackageMinus className="w-5 h-5 text-primary" />
            Allocation Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10 font-bold">
              <TableRow>
                <TableHead className="pl-6 font-bold w-32">Alloc ID</TableHead>
                <TableHead className="font-bold">Request ID</TableHead>
                <TableHead className="font-bold">Source Center</TableHead>
                <TableHead className="font-bold">Quantity</TableHead>
                <TableHead className="font-bold">Allocation Date</TableHead>
                <TableHead className="text-right pr-6 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((alloc) => (
                <TableRow key={alloc.allocation_id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-semibold text-primary">#{alloc.allocation_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 font-medium">
                      <Hash className="w-3 h-3" /> Req #{alloc.request_id}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{alloc.center}</TableCell>
                  <TableCell className="font-bold text-base">{alloc.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground flex items-center gap-2 py-4">
                    <Calendar className="w-3.5 h-3.5" /> {alloc.date}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" />}>
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(alloc)} className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4" /> Edit Allocation
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(alloc.allocation_id)} 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1.5 h-8">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </Button>
                    </div>
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
            <DialogTitle>Modify Allocation Entry</DialogTitle>
            <DialogDescription>
              Update allocation details for Allocation ID #{currentAlloc?.allocation_id}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-request_id">Request ID</Label>
                <Input 
                  id="edit-request_id" 
                  value={formData.request_id}
                  onChange={(e) => setFormData({...formData, request_id: e.target.value})}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-center">Source Center</Label>
                <Input 
                  id="edit-center" 
                  value={formData.center}
                  onChange={(e) => setFormData({...formData, center: e.target.value})}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity Allocated</Label>
                <Input 
                  id="edit-quantity" 
                  type="number" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Update Allocation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
