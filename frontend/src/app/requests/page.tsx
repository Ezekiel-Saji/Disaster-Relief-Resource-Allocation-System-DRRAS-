"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, AlertCircle } from "lucide-react";
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

export default function RequestsPage() {
  const [requests, setRequests] = useState([
    { request_id: 101, area: "North Sector", resource: "Food Kits", quantity: 500, date: "2024-03-07", status: "Pending", urgency: "High" },
    { request_id: 102, area: "South Ridge", resource: "Water Pallets", quantity: 200, date: "2024-03-07", status: "Approved", urgency: "Critical" },
    { request_id: 103, area: "East Village", resource: "Medical Supplies", quantity: 50, date: "2024-03-07", status: "Allocated", urgency: "Medium" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    area: "",
    resource: "",
    quantity: "",
    urgency: "Medium",
  });

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 100 + requests.length + 1;
    const today = new Date().toISOString().split('T')[0];
    
    setRequests([
      ...requests,
      {
        request_id: id,
        area: newRequest.area,
        resource: newRequest.resource,
        quantity: parseInt(newRequest.quantity) || 0,
        date: today,
        status: "Pending",
        urgency: newRequest.urgency
      }
    ]);
    
    setNewRequest({ area: "", resource: "", quantity: "", urgency: "Medium" });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Area Requests</h1>
          <p className="text-muted-foreground mt-1">Ground officers can request immediate resources here.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 border-none text-white">
              <PlusCircle className="w-4 h-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Resource Request</DialogTitle>
              <DialogDescription>
                Submit a request for supplies to be delivered to an affected area.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRequest}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="area">Affected Area</Label>
                  <Input 
                    id="area" 
                    placeholder="e.g. North Sector" 
                    value={newRequest.area}
                    onChange={(e) => setNewRequest({...newRequest, area: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource Type</Label>
                  <Input 
                    id="resource" 
                    placeholder="e.g. Food Kits, Tents" 
                    value={newRequest.resource}
                    onChange={(e) => setNewRequest({...newRequest, resource: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="100" 
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({...newRequest, quantity: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select 
                      value={newRequest.urgency} 
                      onValueChange={(val) => setNewRequest({...newRequest, urgency: val ?? "Medium"})}
                    >
                      <SelectTrigger id="urgency">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
            Recent Requests Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-24">Req ID</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.request_id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-semibold text-muted-foreground">#{request.request_id}</TableCell>
                  <TableCell className="font-medium">{request.area}</TableCell>
                  <TableCell>{request.resource}</TableCell>
                  <TableCell>{request.quantity.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 grayscale opacity-70">
                      <AlertCircle className={`w-3.5 h-3.5 ${
                        request.urgency === "Critical" ? "text-red-500 opacity-100 grayscale-0" : 
                        request.urgency === "High" ? "text-orange-500 opacity-100 grayscale-0" : 
                        "text-yellow-500"
                      }`} />
                      <span className="text-xs">{request.urgency}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge variant={
                      request.status === "Pending" ? "secondary" :
                      request.status === "Approved" ? "outline" :
                      "default"
                    } className={
                      request.status === "Approved" ? "border-blue-500 text-blue-600" :
                      request.status === "Allocated" ? "bg-green-500 hover:bg-green-600" : ""
                    }>
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
