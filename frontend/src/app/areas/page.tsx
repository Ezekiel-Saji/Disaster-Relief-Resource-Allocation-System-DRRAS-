"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
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

export default function AreasPage() {
  const [areas, setAreas] = useState([
    { area_id: 1, name: "North Sector", disaster: "Flood", population: 15000, severity_score: 8.5, last_assistance: "2024-03-02" },
    { area_id: 2, name: "East Village", disaster: "Flood", population: 8000, severity_score: 6.2, last_assistance: "2024-03-04" },
    { area_id: 3, name: "South Ridge", disaster: "Earthquake", population: 25000, severity_score: 9.8, last_assistance: "2024-03-06" },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newArea, setNewArea] = useState({
    name: "",
    disaster: "",
    population: "",
    severity_score: "",
  });

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    const id = areas.length + 1;
    const today = new Date().toISOString().split('T')[0];
    
    setAreas([
      ...areas,
      {
        area_id: id,
        name: newArea.name,
        disaster: newArea.disaster,
        population: parseInt(newArea.population) || 0,
        severity_score: parseFloat(newArea.severity_score) || 0,
        last_assistance: today
      }
    ]);
    
    setNewArea({ name: "", disaster: "", population: "", severity_score: "" });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affected Areas</h1>
          <p className="text-muted-foreground mt-1">Detailed list of impacted regions and their status.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Affected Area
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register Affected Area</DialogTitle>
              <DialogDescription>
                Enter the details of the newly impacted area to track relief operations.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddArea}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Area Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. West Coast" 
                    value={newArea.name}
                    onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="disaster">Disaster Type</Label>
                  <Input 
                    id="disaster" 
                    placeholder="e.g. Cyclone" 
                    value={newArea.disaster}
                    onChange={(e) => setNewArea({...newArea, disaster: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="population">Population</Label>
                    <Input 
                      id="population" 
                      type="number" 
                      placeholder="5000" 
                      value={newArea.population}
                      onChange={(e) => setNewArea({...newArea, population: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity (0-10)</Label>
                    <Input 
                      id="severity" 
                      type="number" 
                      step="0.1" 
                      max="10" 
                      placeholder="7.5" 
                      value={newArea.severity_score}
                      onChange={(e) => setNewArea({...newArea, severity_score: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Area Impact List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area Name</TableHead>
                <TableHead>Disaster</TableHead>
                <TableHead>Population</TableHead>
                <TableHead>Severity Score</TableHead>
                <TableHead>Last Assistance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.area_id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.disaster}</TableCell>
                  <TableCell>{area.population.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={area.severity_score > 8 ? "destructive" : area.severity_score > 6 ? "outline" : "secondary"}>
                      {area.severity_score}/10
                    </Badge>
                  </TableCell>
                  <TableCell>{area.last_assistance}</TableCell>
                </TableRow>
              ))}
              {areas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No affected areas registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
