import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPatientSchema, 
  insertActivityLogSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      
      // Log the login activity
      await storage.createActivityLog({
        userId: user.id,
        action: "Login",
        details: "User logged in successfully",
        ipAddress: "127.0.0.1",
      });
      
      // Update last login time
      await storage.updateUserLastLogin(user.id);
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Set up session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "meditrack_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication middleware
  function isAuthenticated(req: Request, res: Response, next: any) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture
        });
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture
    });
  });

  app.post("/api/auth/logout", isAuthenticated, (req, res) => {
    const userId = (req.user as any).id;
    
    // Log the logout activity
    storage.createActivityLog({
      userId,
      action: "Logout",
      details: "User logged out",
      ipAddress: "127.0.0.1",
    });
    
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Patient routes
  app.get("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const barangay = req.query.barangay as string | undefined;
      const dateFilter = req.query.dateFilter as string | undefined;
      
      let patients;
      
      if (search) {
        patients = await storage.searchPatients(search);
      } else {
        patients = await storage.filterPatients(barangay, dateFilter);
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patients" });
    }
  });

  app.get("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient" });
    }
  });

  app.post("/api/patients", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const patient = insertPatientSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      // Check if patient ID already exists
      if (patient.patientId) {
        const existingPatient = await storage.getPatientByPatientId(patient.patientId);
        if (existingPatient) {
          return res.status(400).json({ message: "Patient ID already exists" });
        }
      }
      
      const newPatient = await storage.createPatient(patient);
      
      // Log activity
      await storage.createActivityLog({
        userId,
        action: "Create Patient",
        details: `Created patient record for ${patient.firstName} ${patient.lastName}`,
        ipAddress: "127.0.0.1",
      });
      
      res.status(201).json(newPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.format() 
        });
      }
      res.status(500).json({ message: "Error creating patient" });
    }
  });

  app.put("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const id = parseInt(req.params.id);
      const patientData = req.body;
      
      const existingPatient = await storage.getPatientById(id);
      if (!existingPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Check if patient ID exists on another record
      if (patientData.patientId && patientData.patientId !== existingPatient.patientId) {
        const duplicatePatient = await storage.getPatientByPatientId(patientData.patientId);
        if (duplicatePatient && duplicatePatient.id !== id) {
          return res.status(400).json({ message: "Patient ID already exists on another record" });
        }
      }
      
      const updatedPatient = await storage.updatePatient(id, patientData);
      
      // Log activity
      await storage.createActivityLog({
        userId,
        action: "Update Patient",
        details: `Updated patient record for ${updatedPatient!.firstName} ${updatedPatient!.lastName}`,
        ipAddress: "127.0.0.1",
      });
      
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.format() 
        });
      }
      res.status(500).json({ message: "Error updating patient" });
    }
  });

  app.delete("/api/patients/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const id = parseInt(req.params.id);
      
      const patient = await storage.getPatientById(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const deleted = await storage.deletePatient(id);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          userId,
          action: "Delete Patient",
          details: `Deleted patient record for ${patient.firstName} ${patient.lastName}`,
          ipAddress: "127.0.0.1",
        });
        
        res.json({ message: "Patient deleted successfully" });
      } else {
        res.status(500).json({ message: "Error deleting patient" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting patient" });
    }
  });

  // Activity Log routes
  app.get("/api/activity-logs", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activity logs" });
    }
  });

  app.get("/api/activity-logs/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const logs = await storage.getUserActivityLogs(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
