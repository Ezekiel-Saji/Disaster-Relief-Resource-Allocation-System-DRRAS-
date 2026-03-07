"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DisastersPage() {
  const [disasters, setDisasters] = useState([
    { disaster_id: 1, disaster_type: "Flood", severity_level: "High", start_date: "2024-03-01", location: "North Sector" },
    { disaster_id: 2, disaster_type: "Earthquake", severity_level: "Critical", start_date: "2024-03-05", location: "South Ridge" },
    { disaster_id: 3, disaster_type: "Cyclone", severity_level: "Medium", start_date: "2024-03-06", location: "East Village" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDisaster, setNewDisaster] = useState({
    type: "",
    location: "",
    severity: "Medium",
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddDisaster = (e: React.FormEvent) => {
    e.preventDefault();
    const id = disasters.length + 1;
    setDisasters([
      ...disasters,
      {
        disaster_id: id,
        disaster_type: newDisaster.type,
        severity_level: newDisaster.severity,
        start_date: newDisaster.date,
        location: newDisaster.location
      }
    ]);
    setIsDialogOpen(false);
    setNewDisaster({
      type: "",
      location: "",
      severity: "Medium",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Disaster Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and record disaster events.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4" /> Add Disaster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Disaster</DialogTitle>
              <DialogDescription>
                Submit details for a new disaster event to trigger response protocols.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDisaster}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Disaster Type</Label>
                  <Input 
                    id="type" 
                    placeholder="e.g. Flood, Wildfire" 
                    value={newDisaster.type}
                    onChange={(e) => setNewDisaster({...newDisaster, type: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. North Province" 
                    value={newDisaster.location}
                    onChange={(e) => setNewDisaster({...newDisaster, location: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity Level</Label>
                    <Select 
                      value={newDisaster.severity} 
                      onValueChange={(val) => setNewDisaster({...newDisaster, severity: val ?? "Medium"})}
                    >
                      <SelectTrigger id="severity">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Start Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newDisaster.date}
                      onChange={(e) => setNewDisaster({...newDisaster, date: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Register Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Active Disasters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-20">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disasters.map((disaster) => (
                <TableRow key={disaster.disaster_id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6 font-semibold text-muted-foreground">#{disaster.disaster_id}</TableCell>
                  <TableCell className="font-medium">{disaster.disaster_type}</TableCell>
                  <TableCell>{disaster.location}</TableCell>
                  <TableCell>
                    <Badge variant={
                      disaster.severity_level === "Critical" ? "destructive" :
                      disaster.severity_level === "High" ? "outline" :
                      "secondary"
                    } className={
                      disaster.severity_level === "High" ? "border-orange-500 text-orange-600" : ""
                    }>
                      {disaster.severity_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{disaster.start_date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
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
