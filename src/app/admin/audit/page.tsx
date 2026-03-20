"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AuditLog,
  AUDIT_EVENT_TYPES,
  filterAuditLogs,
  formatAuditEventLabel,
  getAuditCategoryBadgeClass,
  summarizeAuditLogs
} from "@/lib/audit";
import { mockStore } from "@/lib/store";
import { ShieldAlert, FileText, Users, Activity } from "lucide-react";

export default function AuditTimelinePage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [actorSearch, setActorSearch] = useState("");

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const auditLogs = await mockStore.getAuditLogs();
        setLogs(auditLogs);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      }
    };

    void loadAuditLogs();
  }, []);

  const filteredLogs = filterAuditLogs(logs, {
    category,
    type,
    actorSearch
  });

  const summary = summarizeAuditLogs(filteredLogs);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.security}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Report Exports</CardTitle>
              <FileText className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.reports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">User Management</CardTitle>
              <Users className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.userManagement}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audit Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="user-management">User Management</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All event types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All event types</SelectItem>
                  {AUDIT_EVENT_TYPES.map((eventType) => (
                    <SelectItem key={eventType} value={eventType}>
                      {formatAuditEventLabel(eventType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by actor email..."
                value={actorSearch}
                onChange={(event) => setActorSearch(event.target.value)}
              />
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-xs font-medium">
                          {format(new Date(log.timestamp), "MMM dd, yyyy hh:mm a")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAuditCategoryBadgeClass(log.category)}>
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatAuditEventLabel(log.type)}</TableCell>
                        <TableCell>{log.actorEmail}</TableCell>
                        <TableCell>{log.targetEmail || "-"}</TableCell>
                        <TableCell>{log.details || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        No audit records match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
