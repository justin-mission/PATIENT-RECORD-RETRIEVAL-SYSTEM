import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

interface PatientViewProps {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}

export function PatientView({ patient, open, onClose }: PatientViewProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Information</DialogTitle>
          <DialogDescription>
            Detailed information for patient record.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              {patient.profilePicture ? (
                <AvatarImage src={patient.profilePicture} alt={`${patient.firstName} ${patient.lastName}`} />
              ) : null}
              <AvatarFallback className="bg-primary text-white text-xl">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">
              {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ""}{patient.lastName}
            </h3>
            <p className="text-muted-foreground">{patient.patientId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Age</h4>
              <p>{patient.age} years</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Gender</h4>
              <p>{patient.gender}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Number</h4>
            <p>{patient.contactNumber || "Not provided"}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
            <p>{patient.address}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Barangay</h4>
            <Badge variant="outline">Barangay {patient.barangay}</Badge>
          </div>

          {patient.lastVisit && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Visit</h4>
              <p>{format(new Date(patient.lastVisit), "MMMM d, yyyy")}</p>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Medical History</h4>
            <div className="bg-muted p-3 rounded-md">
              <p className="whitespace-pre-line">{patient.medicalHistory || "No medical history recorded."}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
