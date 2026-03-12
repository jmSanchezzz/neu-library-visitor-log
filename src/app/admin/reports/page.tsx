"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { COLLEGES, OFFICES, REASONS } from "@/lib/constants";
import { mockStore, VisitLog } from "@/lib/store";
import { 
  Download, 
  Filter, 
  Search, 
  RotateCcw, 
  Calendar as CalendarIcon 
} from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<VisitLog[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [collegeFilter, setCollegeFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  
  // Date range states
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    const fetchLogs = async () => {
      const allLogs = await mockStore.getVisitLogs();
      setLogs(allLogs);
      setFilteredLogs([...allLogs].reverse());
    };
    
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];

    if (search) {
      result = result.filter(l => 
        l.userName.toLowerCase().includes(search.toLowerCase()) || 
        l.userEmail.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      result = result.filter(l => l.userRole === roleFilter);
    }

    if (collegeFilter !== "all") {
      result = result.filter(l => l.collegeOrOffice === collegeFilter);
    }

    if (reasonFilter !== "all") {
      result = result.filter(l => l.reason === reasonFilter);
    }

    // Date Range Filtering
    if (startDate) {
      result = result.filter(l => {
        const logDate = parseISO(l.timestamp);
        return isAfter(logDate, startOfDay(startDate)) || logDate.getTime() === startOfDay(startDate).getTime();
      });
    }

    if (endDate) {
      result = result.filter(l => {
        const logDate = parseISO(l.timestamp);
        return isBefore(logDate, endOfDay(endDate)) || logDate.getTime() === endOfDay(endDate).getTime();
      });
    }

    setFilteredLogs(result.reverse());
  }, [search, roleFilter, collegeFilter, reasonFilter, startDate, endDate, logs]);

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Department", "Reason", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(l => [
        `"${l.userName}"`,
        `"${l.userEmail}"`,
        `"${l.userRole}"`,
        `"${l.collegeOrOffice}"`,
        `"${l.reason}"`,
        `"${l.timestamp}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NEU_Library_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setCollegeFilter("all");
    setReasonFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search visitor by name or email..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={exportToCSV} className="bg-accent hover:bg-accent/90 text-white shadow-md">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">User Role</label>
              <Select onValueChange={setRoleFilter} value={roleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">College/Office</label>
              <Select onValueChange={setCollegeFilter} value={collegeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Academic Colleges</div>
                  {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <div className="mx-2 my-1 border-t" />
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Administrative Offices</div>
                  {OFFICES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Visit Reason</label>
              <Select onValueChange={setReasonFilter} value={reasonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-sidebar text-white">
              <TableRow className="hover:bg-sidebar">
                <TableHead className="text-white font-bold">Visitor</TableHead>
                <TableHead className="text-white font-bold">Role</TableHead>
                <TableHead className="text-white font-bold">College/Office</TableHead>
                <TableHead className="text-white font-bold">Reason</TableHead>
                <TableHead className="text-white font-bold text-right">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/5">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sidebar">{log.userName}</span>
                        <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-accent text-accent">
                        {log.userRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="text-sm truncate block">{log.collegeOrOffice}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {log.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex flex-col text-xs">
                        <span className="font-bold">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</span>
                        <span className="text-muted-foreground">{format(new Date(log.timestamp), 'hh:mm a')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="w-10 h-10 opacity-20" />
                      <p>No records found matching the current filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 bg-muted/20 border-t text-xs text-muted-foreground flex justify-between items-center">
            <span>Showing {filteredLogs.length} of {logs.length} total visit records</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled>Previous</Button>
              <Button variant="ghost" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
