"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BrainCircuit, BarChart, History } from "lucide-react";
import { mockStore } from "@/lib/store";
import { analyzeVisitorTrends, VisitorTrendAnalysisOutput } from "@/ai/flows/visitor-trend-analysis-flow";

export default function AnalyticsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisitorTrendAnalysisOutput | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const logs = mockStore.getVisitLogs();
    
    // Process logs to AI format
    const visitLogs = logs.map(l => ({
      timestamp: l.timestamp,
      reasonForVisiting: l.reason,
      collegeOrOffice: l.collegeOrOffice
    }));

    try {
      const output = await analyzeVisitorTrends({
        visitLogs,
        timePeriodDescription: "the last month"
      });
      setResult(output);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar">AI Insight Assistant</h2>
            <p className="text-muted-foreground">Process historical logs to discover hidden usage patterns</p>
          </div>
          <Button 
            onClick={runAnalysis} 
            disabled={isAnalyzing}
            className="bg-sidebar hover:bg-sidebar/90 text-white shadow-xl px-6 h-12"
          >
            {isAnalyzing ? (
              <>
                <History className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2 text-accent" />
                Run AI Trend Analysis
              </>
            )}
          </Button>
        </div>

        {!result && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/5">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <BrainCircuit className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No active analysis</h3>
            <p className="text-muted-foreground max-w-sm text-center mt-2">
              Click the button above to generate a summary of visitor trends using NEU's institutional AI engine.
            </p>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Summary */}
            <Card className="md:col-span-2 shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  <CardTitle>Usage Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed text-sidebar/80 italic border-l-4 border-accent pl-4 bg-accent/5 py-4">
                  "{result.summary}"
                </p>
                
                <div className="pt-4">
                  <h4 className="font-bold mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    Identified Peak Periods
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.peakHours?.map((hour, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Reasons */}
            <Card className="shadow-lg border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle>Top Drivers</CardTitle>
                <CardDescription>Most popular visit reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.mostPopularReasons?.map((reason, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="font-medium">{reason.reason}</span>
                      <Badge className="bg-accent text-white">{reason.count} visits</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Trends */}
            <Card className="md:col-span-3 shadow-lg bg-sidebar text-white overflow-hidden">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-accent">Department-Specific Patterns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {result.departmentTrends?.map((dept, idx) => (
                    <div key={idx} className="p-6 border-r border-b border-white/10 last:border-r-0 hover:bg-white/5 transition-colors">
                      <h5 className="font-bold text-accent mb-2">{dept.collegeOrOffice}</h5>
                      <p className="text-sm opacity-80 leading-snug">{dept.summary}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Minimal Clock icon import helper
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}