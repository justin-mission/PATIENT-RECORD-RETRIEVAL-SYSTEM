import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PatientTable } from "@/components/patients/patient-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, FileDown } from "lucide-react";

export default function Patients() {
  const { toast } = useToast();
  
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const res = await fetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  const exportToCSV = () => {
    try {
      if (patients.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no patient records to export.",
          variant: "default",
        });
        return;
      }

      // Format data for CSV
      const headers = [
        "Patient ID",
        "First Name",
        "Last Name", 
        "Middle Name",
        "Age",
        "Gender",
        "Contact Number",
        "Address",
        "Barangay",
        "Medical History",
        "Last Visit"
      ].join(",");

      interface Patient {
        patientId: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        age: number;
        gender: string;
        contactNumber?: string;
        address: string;
        barangay: string;
        medicalHistory?: string;
        lastVisit?: string;
      }
        
      const csvRows = patients.map((patient: Patient) => {
        // Convert patient object to CSV row, ensuring values with commas are quoted
        const sanitize = (value: any) => {
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        };

        return [
          sanitize(patient.patientId),
          sanitize(patient.firstName),
          sanitize(patient.lastName),
          sanitize(patient.middleName),
          sanitize(patient.age),
          sanitize(patient.gender),
          sanitize(patient.contactNumber),
          sanitize(patient.address),
          sanitize(patient.barangay),
          sanitize(patient.medicalHistory),
          patient.lastVisit ? sanitize(new Date(patient.lastVisit).toLocaleDateString()) : ''
        ].join(",");
      });

      const csvContent = [headers, ...csvRows].join("\n");
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `patient_records_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `${patients.length} patient records exported to CSV.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      });
      console.error("Export error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header title="Patient Records" />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Patient Records</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportToCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Link href="/add-patient">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </Link>
            </div>
          </div>
          
          <PatientTable />
        </main>
      </div>
    </div>
  );
}
