import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientView } from "@/components/patients/patient-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Calendar, Eye, Edit, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

interface Patient {
  id: number;
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
  profilePicture?: string;
}

export function PatientTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [barangay, setBarangay] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const { data: patients = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/patients", searchQuery, barangay, dateFilter],
    queryFn: async () => {
      let url = "/api/patients";
      const params = new URLSearchParams();
      
      if (searchQuery) params.append("search", searchQuery);
      if (barangay) params.append("barangay", barangay);
      if (dateFilter) params.append("dateFilter", dateFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/patients/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Patient deleted",
        description: "Patient record has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setDeleteConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      deleteMutation.mutate(patientToDelete.id);
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      cell: (patient: Patient) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-4">
            {patient.profilePicture ? (
              <AvatarImage src={patient.profilePicture} alt={`${patient.firstName} ${patient.lastName}`} />
            ) : null}
            <AvatarFallback className="bg-primary text-white">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${patient.firstName} ${patient.lastName}`}</div>
            <div className="text-sm text-muted-foreground">{`${patient.age} years, ${patient.gender}`}</div>
          </div>
        </div>
      ),
    },
    {
      key: "patientId",
      header: "ID",
      cell: (patient: Patient) => <div>{patient.patientId}</div>,
    },
    {
      key: "barangay",
      header: "Barangay",
      cell: (patient: Patient) => <div>{patient.barangay}</div>,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (patient: Patient) => <div>{patient.contactNumber || "-"}</div>,
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      cell: (patient: Patient) => (
        <div>
          {patient.lastVisit
            ? format(new Date(patient.lastVisit), "MMM d, yyyy")
            : "-"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (patient: Patient) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewPatient(patient)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/edit-patient/${patient.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteClick(patient)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Sort patients alphabetically
  const sortedPatients = [...patients].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return sortOrder === "asc" 
      ? nameA.localeCompare(nameB) 
      : nameB.localeCompare(nameA);
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={barangay}
          onValueChange={setBarangay}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Barangay" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Barangays</SelectItem>
            {["191", "192", "193", "194", "195", "196", "197", "198", "199", "200"].map((b) => (
              <SelectItem key={b} value={b}>
                Barangay {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateFilter}
          onValueChange={setDateFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Dates</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="thisYear">This year</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={toggleSortOrder}
          className="flex items-center justify-center gap-2"
        >
          <span>Sort: {sortOrder === "asc" ? "A to Z" : "Z to A"}</span>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      ) : (
        <DataTable
          data={sortedPatients}
          columns={columns}
        />
      )}

      {viewPatient && (
        <PatientView
          patient={viewPatient}
          open={Boolean(viewPatient)}
          onClose={() => setViewPatient(null)}
        />
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the patient record for{" "}
              <span className="font-semibold">
                {patientToDelete?.firstName} {patientToDelete?.lastName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
