import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, AlertCircle, CalendarClock } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";

export default function Dashboard() {
  // Fetch recent patients
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  // Get recent logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["/api/activity-logs"],
    queryFn: async () => {
      const res = await fetch("/api/activity-logs");
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      return res.json();
    },
  });

  // Calculate dashboard metrics
  const totalPatients = patients.length;
  const recentPatients = patients
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentLogs = activityLogs.slice(0, 8);

  // Columns for recent patients table
  const patientColumns = [
    {
      key: "name",
      header: "Name",
      cell: (patient: any) => (
        <div>{`${patient.firstName} ${patient.lastName}`}</div>
      ),
    },
    {
      key: "id",
      header: "ID",
      cell: (patient: any) => <div>{patient.patientId}</div>,
    },
    {
      key: "created",
      header: "Added On",
      cell: (patient: any) => (
        <div>
          {patient.createdAt
            ? format(new Date(patient.createdAt), "MMM d, yyyy")
            : "-"}
        </div>
      ),
    },
  ];

  // Columns for activity logs table
  const logColumns = [
    {
      key: "action",
      header: "Action",
      cell: (log: any) => <div>{log.action}</div>,
    },
    {
      key: "details",
      header: "Details",
      cell: (log: any) => <div>{log.details}</div>,
    },
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log: any) => (
        <div>
          {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header title="Dashboard" />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  Patient records in system
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Patient visits today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Pending Actions
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Tasks requiring attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Today's Date
                </CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {format(new Date(), "MMM d, yyyy")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(), "EEEE")}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPatients.length > 0 ? (
                  <DataTable
                    data={recentPatients}
                    columns={patientColumns}
                  />
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No patient records found.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentLogs.length > 0 ? (
                  <DataTable
                    data={recentLogs}
                    columns={logColumns}
                  />
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No activity recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
