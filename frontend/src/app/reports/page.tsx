import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Visual summaries of resource usage and efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <BarChart3 className="w-4 h-4 text-primary"/> Resource Usage Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] bg-muted/30 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
            Usage Chart Canvas
          </CardContent>
        </Card>
        
        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
              <BarChart3 className="w-4 h-4 text-green-500"/> Allocation Efficiency Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] bg-muted/30 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
            Efficiency Chart Canvas
          </CardContent>
        </Card>

        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
               Disaster Occurrence Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] bg-muted/30 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
            Frequency Radar Canvas
          </CardContent>
        </Card>

        <Card className="min-h-[350px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold">
               Delivery Completion Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] bg-muted/30 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
            Line Chart Canvas
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
