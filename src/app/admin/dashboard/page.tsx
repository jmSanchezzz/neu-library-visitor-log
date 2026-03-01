"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp,
  UserCheck
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockStore, VisitLog } from "@/lib/store";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalToday: 0,
    peakHour: "9:00 AM",
    topCollege: "None",
    topReason: "None"
  });
  const [recentLogs, setRecentLogs] = useState<VisitLog[]>([]);

  useEffect(() => {
    const logs = mockStore.getVisitLogs();
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.timestamp.startsWith(today));

    // Stats calculation
    const collegeCounts: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};
    
    todayLogs.forEach(log => {
      collegeCounts[log.collegeOrOffice] = (collegeCounts[log.collegeOrOffice] || 0) + 1;
      reasonCounts[log.reason] = (reasonCounts[log.reason] || 0) + 1;
    });

    const topCollege = Object.entries(collegeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "No Data";
    const topReason = Object.entries(reasonCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "No Data";

    setStats({
      totalToday: todayLogs.length,
      peakHour: "10:00 AM - 12:00 PM", // Mock peak
      topCollege,
      topReason
    });

    setRecentLogs(todayLogs.slice(-10).reverse());
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-md border-l-4 border-l-primary hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Visitors</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalToday}</div>
              <p className="text-xs text-green-500 flex items-center mt-1 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Live Tracking
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-accent hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Peak Visiting Hour</CardTitle>
              <Clock className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.peakHour}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Expected High Volume</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-sidebar hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Department</CardTitle>
              <MapPin className="h-5 w-5 text-sidebar" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{stats.topCollege}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Most active college</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-primary/50 hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Frequent Activity</CardTitle>
              <UserCheck className="h-5 w-5 text-primary/50" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{stats.topReason}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Primary visit reason</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs Table */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
            <div>
              <CardTitle className="text-xl text-sidebar">Recent Check-ins</CardTitle>
              <p className="text-sm text-muted-foreground">Real-time visitor feed for {format(new Date(), 'MMMM dd, yyyy')}</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Live</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>College/Office</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Check-in Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {log.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.collegeOrOffice}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {format(new Date(log.timestamp), 'hh:mm:ss a')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                      No visitors logged yet today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}