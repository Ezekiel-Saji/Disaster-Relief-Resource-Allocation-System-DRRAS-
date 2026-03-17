"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Edit, Trash2, AlertTriangle, Loader2, Activity } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface Disaster {
  disaster_id: number;
  disaster_type: string;
  severity_level: string;
  start_date: string;
  location: string; // Enriched from v_disasters (first affected area)
}

export default function DisastersPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newDisaster, setNewDisaster] = useState({
    type: "",
    severity: "Medium",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDisasters();
  }, []);

  async function fetchDisasters() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_disasters')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setDisasters(data || []);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddDisaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Calling fn_add_disaster(p_disaster_type, p_severity_level, p_start_date)
      const { error } = await supabase.rpc('fn_add_disaster', {
        p_disaster_type: newDisaster.type,
        p_severity_level: newDisaster.severity,
        p_start_date: newDisaster.date
      });

      if (error) throw error;

      await fetchDisasters();
      setIsDialogOpen(false);
      setNewDisaster({
        type: "",
        severity: "Medium",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error adding disaster via RPC:", error);
      alert("Failed to register disaster. Please check database connectivity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Disaster Management Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium italic">Command center for disaster registration and event monitoring.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-lg" />}>
            <PlusCircle className="w-4 h-4" /> Register New Disaster
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight">Declare Emergency Event</DialogTitle>
              <DialogDescription className="font-medium">
                Once registered, proceed to 'Affected Areas' to link geographies to this event.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDisaster}>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Incident Type
                  </Label>
                  <Input 
                    id="type" 
                    placeholder="e.g. Flash Flood, Cyclone Nivar" 
                    value={newDisaster.type}
                    onChange={(e) => setNewDisaster({...newDisaster, type: e.target.value})}
                    required 
                    className="bg-muted/30 font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="severity" className="font-bold">Severity Level</Label>
                    <Select 
                      value={newDisaster.severity} 
                      onValueChange={(val) => setNewDisaster({...newDisaster, severity: val ?? "Medium"})}
                    >
                      <SelectTrigger id="severity" className="bg-muted/30 font-semibold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medium" className="font-medium text-blue-600">Medium</SelectItem>
                        <SelectItem value="High" className="font-medium text-orange-600">High</SelectItem>
                        <SelectItem value="Critical" className="font-medium text-red-600">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="font-bold">Onset Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newDisaster.date}
                      onChange={(e) => setNewDisaster({...newDisaster, date: e.target.value})}
                      required 
                      className="bg-muted/30 font-semibold"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-muted/20 p-4 -mx-6 -mb-6 border-t">
                <Button type="submit" className="w-full font-bold h-11" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing Response...
                    </>
                  ) : (
                    "Initialize Emergency Protocol"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl overflow-hidden rounded-2xl border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2 font-bold uppercase tracking-wider text-primary">
            <AlertTriangle className="w-5 h-5 text-red-500 fill-red-500/10" />
            Active Incident Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-24 font-bold text-xs uppercase tracking-tighter">Event ID</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-tighter">Type / Description</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-tighter">Primary Heatmap</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-tighter">Severity</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-tighter">Timestamp</TableHead>
                <TableHead className="text-right pr-6 font-bold text-xs uppercase tracking-tighter">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                      <p className="font-mono text-sm tracking-widest uppercase">Synchronizing with Cloud Views...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : disasters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic font-medium">
                    No incident records detected in v_disasters ledger.
                  </TableCell>
                </TableRow>
              ) : (
                disasters.map((disaster) => (
                  <TableRow key={disaster.disaster_id} className="hover:bg-muted/5 transition-all group border-b last:border-0">
                    <TableCell className="pl-6 font-bold text-muted-foreground font-mono">
                      <Badge variant="outline" className="text-[10px] bg-muted/20">#{disaster.disaster_id}</Badge>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-800">{disaster.disaster_type}</TableCell>
                    <TableCell className="font-semibold text-slate-600">
                      {disaster.location || <span className="text-muted-foreground italic opacity-50">No areas linked</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        disaster.severity_level === "Critical" ? "destructive" :
                        disaster.severity_level === "High" ? "outline" :
                        "secondary"
                      } className={`font-black px-2 py-0.5 rounded-sm ${
                        disaster.severity_level === "High" ? "border-orange-500 text-orange-600 bg-orange-50" : ""
                      }`}>
                        {disaster.severity_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums text-slate-500">
                      {new Date(disaster.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10"><Edit className="w-4 h-4" /></Button>
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
