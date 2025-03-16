import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format } from "date-fns";

interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export default function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
    queryFn: async () => {
      const res = await fetch("/api/activity-logs");
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      return res.json();
    },
  });

  // Filter logs based on search
  const filteredLogs = logs.filter((log: ActivityLog) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower) ||
      log.ipAddress.includes(searchQuery)
    );
  });

  const columns = [
    {
      key: "timestamp",
      header: "Date & Time",
      cell: (log: ActivityLog) => (
        <div className="whitespace-nowrap">
          {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
        </div>
      ),
    },
    {
      key: "userId",
      header: "User ID",
      cell: (log: ActivityLog) => <div>{log.userId}</div>,
    },
    {
      key: "action",
      header: "Action",
      cell: (log: ActivityLog) => (
        <div className="font-medium">{log.action}</div>
      ),
    },
    {
      key: "details",
      header: "Details",
      cell: (log: ActivityLog) => <div>{log.details}</div>,
    },
    {
      key: "ipAddress",
      header: "IP Address",
      cell: (log: ActivityLog) => <div>{log.ipAddress}</div>,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header title="User Activity Log" />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Monitoring</CardTitle>
              <CardDescription>
                Track user logins and system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading activity logs...</p>
                  </div>
                </div>
              ) : (
                <DataTable
                  data={filteredLogs}
                  columns={columns}
                  searchPlaceholder="Search activities..."
                  onSearch={setSearchQuery}
                  searchValue={searchQuery}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
