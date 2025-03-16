import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PatientForm } from "@/components/patients/patient-form";

export default function AddPatient() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header title="Add Patient" />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Add New Patient</h1>
            <p className="text-muted-foreground">
              Create a new patient record by filling out the form below.
            </p>
          </div>
          
          <PatientForm />
        </main>
      </div>
    </div>
  );
}
