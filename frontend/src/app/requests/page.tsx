"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, AlertCircle, Loader2, Calendar } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface AreaRequest {
  request_id: number;
  area: string;
  area_id: number;
  resource: string;
  resource_id: number;
  quantity: number;
  urgency: string;
  weight_score: number;
  date: string;
  status: string;
}

const URGENCY_CONFIG: Record<string, { color: string, iconColor: string }> = {
  "Critical": { color: "text-red-700 bg-red-50", iconColor: "text-red-500" },
  "High": { color: "text-orange-700 bg-orange-50", iconColor: "text-orange-500" },
  "Medium": { color: "text-amber-700 bg-amber-50", iconColor: "text-amber-500" },
  "Low": { color: "text-blue-700 bg-blue-50", iconColor: "text-blue-500" },
};

const STATUS_VARIANTS: Record<string, "secondary" | "outline" | "default" | "destructive"> = {
  "Pending": "secondary",
  "Approved": "outline",
  "Allocated": "default",
  "Delivered": "secondary",
};

const STATUS_COLORS: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700 border-none",
  "Approved": "border-blue-500 text-blue-600",
  "Allocated": "bg-green-500 hover:bg-green-600 text-white",
  "Delivered": "bg-blue-600 text-white",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<AreaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [areas, setAreas] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  
  const [newRequest, setNewRequest] = useState({
    area_id: "",
    resource_id: "",
    quantity: "",
    priority_id: "",
  });

  async function fetchRequests() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_area_requests')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata() {
    try {
      const { data: areasData } = await supabase.from('v_lookup_areas').select('*');
      const { data: resourcesData } = await supabase.from('v_lookup_resources').select('*');
      const { data: prioritiesData } = await supabase.from('v_lookup_priorities').select('*');
      
      setAreas(areasData || []);
      setResources(resourcesData || []);
      setPriorities(prioritiesData || []);
      
      // Default priority if available
      if (prioritiesData && prioritiesData.length > 0) {
        setNewRequest(prev => ({ ...prev, priority_id: prioritiesData.find(p => p.name === 'Medium')?.id?.toString() || prioritiesData[0]?.id?.toString() || "" }));
      }
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
  }

  useEffect(() => {
    fetchRequests();
    fetchMetadata();
  }, []);

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase.rpc('fn_submit_request', {
        p_area_id: parseInt(newRequest.area_id),
        p_resource_id: parseInt(newRequest.resource_id),
        p_quantity: parseInt(newRequest.quantity),
        p_priority_id: parseInt(newRequest.priority_id)
      });

      if (error) throw error;

      await fetchRequests();
      setNewRequest({ area_id: "", resource_id: "", quantity: "", priority_id: newRequest.priority_id });
      setIsDialogOpen(false);
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
      alert("Failed to submit request. Please check the console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Area Requests</h1>
          <p className="text-muted-foreground mt-1">Ground officers can request immediate resources here.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 bg-orange-500 hover:bg-orange-600 border-none text-white font-semibold shadow-lg" />}>
            <PlusCircle className="w-4 h-4" /> New Request
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Submit Resource Request</DialogTitle>
              <DialogDescription>
                Submit a request for supplies to be delivered to an affected area.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRequest}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="area">Affected Area</Label>
                  <Select 
                    value={newRequest.area_id} 
                    onValueChange={(val) => setNewRequest({...newRequest, area_id: val || ""})}
                  >
                    <SelectTrigger id="area" className="bg-muted/30">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.filter(area => area.id != null).map((area) => (
                        <SelectItem key={area.id} value={area.id.toString()}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="resource">Resource Type</Label>
                  <Select 
                    value={newRequest.resource_id} 
                    onValueChange={(val) => setNewRequest({...newRequest, resource_id: val || ""})}
                  >
                    <SelectTrigger id="resource" className="bg-muted/30">
                      <SelectValue placeholder="Select Resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.filter(resource => resource.id != null).map((resource) => (
                        <SelectItem key={resource.id} value={resource.id.toString()}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Urgency</Label>
                    <Select 
                      value={newRequest.priority_id} 
                      onValueChange={(val) => setNewRequest({...newRequest, priority_id: val ?? ""})}
                    >
                      <SelectTrigger id="priority" className="bg-muted/30">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.filter(p => p.id != null).map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-5 h-5 text-primary" />
            Recent Requests Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="pl-6 w-24 font-bold">Req ID</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="font-bold">Resource</TableHead>
                <TableHead className="font-bold text-center">Quantity</TableHead>
                <TableHead className="font-bold">Urgency</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="text-right pr-6 font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    Loading Requests...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                    No resource requests found in registry.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.request_id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6 font-semibold text-muted-foreground">#{request.request_id}</TableCell>
                    <TableCell className="font-semibold">{request.area}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                        {request.resource}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-center">{request.quantity?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium">
                        <AlertCircle className={`w-3.5 h-3.5 ${URGENCY_CONFIG[request.urgency]?.iconColor || "text-yellow-500"}`} />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${URGENCY_CONFIG[request.urgency]?.color || "bg-muted text-muted-foreground"}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {request.date ? new Date(request.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge 
                        variant={STATUS_VARIANTS[request.status] || "secondary"}
                        className={`font-semibold ${STATUS_COLORS[request.status] || ""}`}
                      >
                        {request.status}
                      </Badge>
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

