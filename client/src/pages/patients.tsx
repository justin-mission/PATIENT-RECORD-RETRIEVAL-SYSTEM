import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PatientTable } from "@/components/patients/patient-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

export default function Patients() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header title="Patient Records" />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Patient Records</h1>
            <Link href="/add-patient">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </Link>
          </div>
          
          <PatientTable />
        </main>
      </div>
    </div>
  );
}
