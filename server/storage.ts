import { 
  users, patients, activityLogs, 
  type User, type InsertUser, 
  type Patient, type InsertPatient, 
  type ActivityLog, type InsertActivityLog 
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;
  filterPatients(barangay?: string, dateFilter?: string): Promise<Patient[]>;
  
  // Activity log operations
  getActivityLogs(): Promise<ActivityLog[]>;
  getUserActivityLogs(userId: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private activityLogs: Map<number, ActivityLog>;
  private userCurrentId: number;
  private patientCurrentId: number;
  private activityLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.activityLogs = new Map();
    this.userCurrentId = 1;
    this.patientCurrentId = 1;
    this.activityLogCurrentId = 1;
    
    // Add admin user by default
    this.createUser({
      username: "admin",
      password: "$2b$10$oMCj9EpuFYqXk2Np5o8Sl.c/J6eMxMNt8BvDXGd4GkaBV9Hk9kwdm", // "admin123"
      fullName: "System Administrator",
      role: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id, lastLogin: null };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastLogin: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.patientId === patientId
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientCurrentId++;
    const patientId = insertPatient.patientId || `PT-${String(id).padStart(4, '0')}`;
    const createdAt = new Date();
    
    const patient: Patient = { 
      ...insertPatient, 
      id, 
      patientId,
      createdAt
    };
    
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = {
      ...patient,
      ...patientData
    };
    
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }
  
  async searchPatients(query: string): Promise<Patient[]> {
    if (!query) return this.getPatients();
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(patient => {
      return (
        patient.firstName.toLowerCase().includes(lowercaseQuery) ||
        patient.lastName.toLowerCase().includes(lowercaseQuery) ||
        patient.patientId.toLowerCase().includes(lowercaseQuery) ||
        (patient.contactNumber && patient.contactNumber.includes(query))
      );
    });
  }
  
  async filterPatients(barangay?: string, dateFilter?: string): Promise<Patient[]> {
    let patients = Array.from(this.patients.values());
    
    if (barangay) {
      patients = patients.filter(patient => patient.barangay === barangay);
    }
    
    if (dateFilter) {
      const now = new Date();
      const lastVisitDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          lastVisitDate.setDate(now.getDate() - 7);
          patients = patients.filter(patient => 
            patient.lastVisit && new Date(patient.lastVisit) >= lastVisitDate
          );
          break;
        case '30days':
          lastVisitDate.setDate(now.getDate() - 30);
          patients = patients.filter(patient => 
            patient.lastVisit && new Date(patient.lastVisit) >= lastVisitDate
          );
          break;
        case '90days':
          lastVisitDate.setDate(now.getDate() - 90);
          patients = patients.filter(patient => 
            patient.lastVisit && new Date(patient.lastVisit) >= lastVisitDate
          );
          break;
        case 'thisYear':
          lastVisitDate.setMonth(0, 1);
          lastVisitDate.setHours(0, 0, 0, 0);
          patients = patients.filter(patient => 
            patient.lastVisit && new Date(patient.lastVisit) >= lastVisitDate
          );
          break;
      }
    }
    
    return patients;
  }

  // Activity log operations
  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getUserActivityLogs(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogCurrentId++;
    const timestamp = new Date();
    
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp
    };
    
    this.activityLogs.set(id, log);
    return log;
  }
}

export const storage = new MemStorage();
