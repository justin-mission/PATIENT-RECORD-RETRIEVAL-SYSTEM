import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckCircle, AlertCircle, CalendarClock, BarChart3 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
    .sort((a: any, b: any) => {
      // Handle cases where createdAt might be undefined
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const recentLogs = activityLogs.slice(0, 8);
  
  interface ChartDataItem {
    barangay: string;
    count: number;
  }

  // Generate barangay distribution data for chart
  const barangayDistribution = patients.reduce((acc: Record<string, number>, patient: any) => {
    const barangay = patient.barangay || 'Unknown';
    acc[barangay] = (acc[barangay] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.entries(barangayDistribution)
    .map(([barangay, count]) => ({
      barangay,
      count
    } as ChartDataItem))
    .sort((a: ChartDataItem, b: ChartDataItem) => b.count - a.count)
    .slice(0, 10); // Show top 10 barangays
    
  // Generate colors based on the primary color
  const COLORS = [
    '#3b82f6', // primary blue
    '#4f93f7',
    '#63a3f8',
    '#78b4f9',
    '#8cc5fa',
    '#a1d5fb',
    '#b5e6fc',
    '#caf7fd',
    '#dffafe',
    '#f3fdff',
  ];

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
          
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Barangay Distribution</CardTitle>
                <CardDescription>
                  Patient distribution across barangays
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <XAxis 
                        dataKey="barangay" 
                        angle={-45} 
                        textAnchor="end" 
                        tick={{ fontSize: 12 }}
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} patients`, 'Count']}
                        labelFormatter={(label) => `Barangay ${label}`}
                      />
                      <Bar dataKey="count" name="Patients">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No patient data available for chart visualization.
                </p>
              )}
            </CardContent>
          </Card>

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
