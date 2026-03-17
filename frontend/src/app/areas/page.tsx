"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Loader2, Eye, Edit, Trash2 } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface Area {
  area_id: number;
  name: string;
  population: number;
  severity_score: number;
  last_assistance_date: string | null;
  disaster_id: number;
}


export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  // const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newDisaster, setNewDisaster] = useState({
    type: "",
    severity: "Medium",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_affected_areas')
        .select('*')
        .order('affected_id', { ascending: true });


      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('fn_add_disaster', {
        p_disaster_type: newDisaster.type,
        p_severity_level: newDisaster.severity,
        p_start_date: newDisaster.date
      });

      if (error) throw error;

      await fetchAreas();
      setIsDialogOpen(false);
      setNewDisaster({
        type: "",
        severity: "Medium",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error adding disaster via function:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Affected Areas</h1>
          <p className="text-muted-foreground mt-1">Detailed list of impacted regions and their status.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90" />}>
            <PlusCircle className="w-4 h-4" /> Add Disaster Event
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Disaster</DialogTitle>
              <DialogDescription>
                Submit details for a new disaster event to trigger response protocols.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddArea}>
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Event"
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
            <MapPin className="w-5 h-5 text-primary" />
            Area Impact List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-20">ID</TableHead>
                <TableHead>Area Name</TableHead>
                <TableHead>Disaster</TableHead>
                <TableHead>Population</TableHead>
                <TableHead>Severity Score</TableHead>
                <TableHead>Last Assistance</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>Loading areas...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No affected areas registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                areas.map((area: any) => (
                  <TableRow key={area.affected_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold text-muted-foreground">#{area.affected_id}</TableCell>
                    <TableCell className="font-medium">{area.area_name}</TableCell>
                    <TableCell>{area.disaster_type}</TableCell>
                    <TableCell>{area.population?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={area.severity_score > 8 ? "destructive" : area.severity_score > 6 ? "outline" : "secondary"}
                             className={area.severity_score > 6 && area.severity_score <= 8 ? "border-orange-500 text-orange-600" : ""}>
                        {area.severity_score}/10
                      </Badge>
                    </TableCell>
                    <TableCell>{area.last_assistance_date || "Never"}</TableCell>
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
