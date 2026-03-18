"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Loader2, Eye, Edit, Trash2, Globe2, AlertCircle } from "lucide-react";
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

interface AffectedArea {
  affected_id: number;
  area_name: string;
  district: string;
  state: string;
  disaster: string;
  population: number;
  severity_score: number;
  last_assistance: string | null;
  disaster_id: number;
  area_id: number;
}

interface LookupArea {
  area_id: number;
  area_name: string;
}

interface LookupDisaster {
  disaster_id: number;
  disaster_type: string;
  location: string;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<AffectedArea[]>([]);
  const [lookupAreas, setLookupAreas] = useState<LookupArea[]>([]);
  const [lookupDisasters, setLookupDisasters] = useState<LookupDisaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    area_id: "",
    disaster_id: "",
    severity_score: "5",
  });

  useEffect(() => {
    fetchAreas();
    fetchMetadata();
  }, []);

  async function fetchAreas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_affected_areas')
        .select('*')
        .order('severity_score', { ascending: false });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const [{ data: areaData }, { data: disasterData }] = await Promise.all([
        supabase.from('v_lookup_areas').select('area_id, area_name'),
        supabase.from('v_disasters').select('disaster_id, disaster_type, location')
      ]);
      setLookupAreas(areaData || []);
      setLookupDisasters(disasterData || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  }

  const handleAddAffectedArea = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('fn_add_affected_area', {
        p_area_id: parseInt(formData.area_id),
        p_disaster_id: parseInt(formData.disaster_id),
        p_severity_score: parseFloat(formData.severity_score)
      });

      if (error) throw error;

      await fetchAreas();
      setIsDialogOpen(false);
      setFormData({
        area_id: "",
        disaster_id: "",
        severity_score: "5",
      });
    } catch (error) {
      console.error("Error adding affected area via RPC:", error);
      alert("Failed to link area to disaster. Ensure area is not already linked.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Regional Impact Tracking</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Monitoring geographic zones under active disaster response.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-lg" />}>
            <PlusCircle className="w-4 h-4" /> Link Impacted Area
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold tracking-tight">Declare Affected Zone</DialogTitle>
              <DialogDescription className="font-medium">
                Link an existing geographic area to an active disaster event and set initial severity.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAffectedArea}>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="area" className="font-bold flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-primary" /> Target Area
                  </Label>
                  <Select 
                    value={formData.area_id} 
                    onValueChange={(val) => setFormData({...formData, area_id: val})}
                  >
                    <SelectTrigger id="area" className="bg-muted/30 font-semibold">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookupAreas.map((a) => (
                        <SelectItem key={a.area_id} value={a.area_id.toString()}>{a.area_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="disaster" className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" /> Active Disaster
                  </Label>
                  <Select 
                    value={formData.disaster_id} 
                    onValueChange={(val) => setFormData({...formData, disaster_id: val})}
                  >
                    <SelectTrigger id="disaster" className="bg-muted/30 font-semibold">
                      <SelectValue placeholder="Select Disaster" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookupDisasters.map((d) => (
                        <SelectItem key={d.disaster_id} value={d.disaster_id.toString()}>
                          {d.disaster_type} ({d.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="severity" className="font-bold">Initial Severity Score</Label>
                    <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{formData.severity_score}/10</span>
                  </div>
                  <Input 
                    id="severity" 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.1" 
                    value={formData.severity_score}
                    onChange={(e) => setFormData({...formData, severity_score: e.target.value})}
                    className="accent-primary"
                  />
                  <p className="text-[10px] text-muted-foreground italic font-medium">Use higher scores for high-impact zones requiring prioritized relief.</p>
                </div>
              </div>
              <DialogFooter className="bg-muted/20 p-4 -mx-6 -mb-6 border-t">
                <Button type="submit" className="w-full font-bold h-11" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Linking Geography...
                    </>
                  ) : (
                    "Authorize Area Linkage"
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
            <MapPin className="w-5 h-5 text-primary fill-primary/10" />
            Area Impact Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent text-xs uppercase font-bold tracking-tight">
                <TableHead className="pl-6 w-24">Link ID</TableHead>
                <TableHead>Geographic Area</TableHead>
                <TableHead>Active Disaster</TableHead>
                <TableHead className="text-center">District/State</TableHead>
                <TableHead className="text-center">Population</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Last Support</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                      <p className="font-mono text-xs tracking-widest uppercase">Fetching Impact Metrics...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic font-medium">
                    No active impact records found in v_affected_areas ledger.
                  </TableCell>
                </TableRow>
              ) : (
                areas.map((area) => (
                  <TableRow key={area.affected_id} className="hover:bg-muted/5 transition-all group border-b last:border-0">
                    <TableCell className="pl-6 font-bold text-muted-foreground font-mono">
                      <Badge variant="outline" className="text-[10px] bg-muted/20 border-none">#{area.affected_id}</Badge>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-800">{area.area_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-2 py-0.5">
                        {area.disaster}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold text-slate-500">
                      {area.district}, {area.state}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-slate-700">
                      {area.population?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={area.severity_score > 8 ? "destructive" : area.severity_score > 6 ? "outline" : "secondary"}
                               className={`font-black tabular-nums ${area.severity_score > 6 && area.severity_score <= 8 ? "border-orange-500 text-orange-600 bg-orange-50" : ""}`}>
                          {area.severity_score}/10
                        </Badge>
                        <div className="flex-1 h-1.5 w-12 bg-muted rounded-full overflow-hidden hidden sm:block">
                           <div 
                             className={`h-full ${area.severity_score > 8 ? 'bg-red-500' : area.severity_score > 6 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                             style={{width: `${area.severity_score * 10}%`}} 
                           />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-500 text-sm">
                      {area.last_assistance ? new Date(area.last_assistance).toLocaleDateString() : "Pending Assist"}
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
