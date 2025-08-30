import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { 
  insertCourseSchema,
  insertEducationPlanSchema,
  insertPlannedSemesterSchema,
  insertArticulationAgreementSchema,
  insertDeadlineSchema,
  insertActivityLogSchema,
  insertTargetSchoolSchema
} from "@shared/schema";
import { z } from "zod";
import axios from "axios";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/csv', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, CSV, and TXT files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get current user (mock for now)
  app.get("/api/user", async (req, res) => {
    // In a real app, this would get the user from session/JWT
    const userId = "demo-user-id";
    let user = await storage.getUser(userId);
    
    if (!user) {
      // Create a demo user
      user = await storage.createUser({
        username: "demo",
        password: "demo",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        currentInstitution: "De Anza College",
        targetMajor: "Computer Science Transfer"
      });
    }
    
    res.json(user);
  });

  // Get institutions
  app.get("/api/institutions", async (req, res) => {
    const institutions = await storage.getInstitutions();
    res.json(institutions);
  });

  // Course management
  app.get("/api/courses", async (req, res) => {
    const userId = "demo-user-id"; // Mock user ID
    const courses = await storage.getCoursesByUser(userId);
    res.json(courses);
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        userId: "demo-user-id"
      });
      const course = await storage.createCourse(courseData);
      
      // Log activity
      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "CREATE_COURSE",
        description: `Added course ${course.courseCode} - ${course.title}`,
        entityType: "COURSE",
        entityId: course.id
      });
      
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data", error });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const updates = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(req.params.id, updates);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Log activity
      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "UPDATE_COURSE",
        description: `Updated course ${course.courseCode}`,
        entityType: "COURSE",
        entityId: course.id
      });
      
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data", error });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    const deleted = await storage.deleteCourse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Log activity
    await storage.createActivityLog({
      userId: "demo-user-id",
      action: "DELETE_COURSE",
      description: `Deleted course`,
      entityType: "COURSE",
      entityId: req.params.id
    });
    
    res.json({ success: true });
  });

  // Education plans
  app.get("/api/education-plans", async (req, res) => {
    const userId = "demo-user-id";
    const plans = await storage.getEducationPlansByUser(userId);
    res.json(plans);
  });

  app.post("/api/education-plans", async (req, res) => {
    try {
      const planData = insertEducationPlanSchema.parse({
        ...req.body,
        userId: "demo-user-id"
      });
      const plan = await storage.createEducationPlan(planData);
      
      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "CREATE_PLAN",
        description: `Created education plan: ${plan.name}`,
        entityType: "PLAN",
        entityId: plan.id
      });
      
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data", error });
    }
  });

  // Planned semesters
  app.get("/api/education-plans/:planId/semesters", async (req, res) => {
    const semesters = await storage.getPlannedSemestersByPlan(req.params.planId);
    res.json(semesters);
  });

  app.post("/api/planned-semesters", async (req, res) => {
    try {
      const semesterData = insertPlannedSemesterSchema.parse(req.body);
      const semester = await storage.createPlannedSemester(semesterData);
      res.json(semester);
    } catch (error) {
      res.status(400).json({ message: "Invalid semester data", error });
    }
  });

  // File upload
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        userId: "demo-user-id",
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: req.body.type || "TRANSCRIPT",
        extractedText: null, // TODO: Implement PDF text extraction
      });

      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "UPLOAD_DOCUMENT",
        description: `Uploaded ${req.file.originalname}`,
        entityType: "DOCUMENT",
        entityId: document.id
      });

      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Upload failed", error });
    }
  });

  // Get uploaded documents
  app.get("/api/documents", async (req, res) => {
    const userId = "demo-user-id";
    const documents = await storage.getDocumentsByUser(userId);
    res.json(documents);
  });

  // Articulation agreements
  app.get("/api/articulation-agreements", async (req, res) => {
    const userId = "demo-user-id";
    const agreements = await storage.getArticulationAgreementsByUser(userId);
    res.json(agreements);
  });

  app.post("/api/articulation-agreements", async (req, res) => {
    try {
      const agreementData = insertArticulationAgreementSchema.parse({
        ...req.body,
        userId: "demo-user-id"
      });
      const agreement = await storage.createArticulationAgreement(agreementData);

      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "CREATE_AGREEMENT",
        description: `Added articulation agreement`,
        entityType: "AGREEMENT",
        entityId: agreement.id
      });
      
      res.json(agreement);
    } catch (error) {
      res.status(400).json({ message: "Invalid agreement data", error });
    }
  });

  // Assist.org API proxy
  app.get("/api/assist/institutions/:id/agreements", async (req, res) => {
    try {
      const response = await axios.get(`https://assist.org/api/institutions/${req.params.id}/agreements`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Assist.org data", error: error.message });
    }
  });

  app.get("/api/assist/agreements", async (req, res) => {
    try {
      const { receivingInstitutionId, sendingInstitutionId, academicYearId, categoryCode } = req.query;
      const response = await axios.get('https://assist.org/api/agreements', {
        params: { receivingInstitutionId, sendingInstitutionId, academicYearId, categoryCode }
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Assist.org data", error: error.message });
    }
  });

  // Deadlines
  app.get("/api/deadlines", async (req, res) => {
    const userId = "demo-user-id";
    const deadlines = await storage.getDeadlinesByUser(userId);
    res.json(deadlines);
  });

  app.post("/api/deadlines", async (req, res) => {
    try {
      const deadlineData = insertDeadlineSchema.parse({
        ...req.body,
        userId: "demo-user-id"
      });
      const deadline = await storage.createDeadline(deadlineData);
      res.json(deadline);
    } catch (error) {
      res.status(400).json({ message: "Invalid deadline data", error });
    }
  });

  // Activity log
  app.get("/api/activity", async (req, res) => {
    const userId = "demo-user-id";
    const activities = await storage.getActivityLogByUser(userId);
    res.json(activities);
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    try {
      const userId = "demo-user-id";
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createActivityLog({
        userId: userId,
        action: "UPDATE_PROFILE",
        description: `Updated profile: ${updates.firstName || ''} ${updates.lastName || ''}`.trim(),
        entityType: "USER",
        entityId: userId
      });
      
      // Return the updated user data
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currentInstitution: user.currentInstitution,
        targetMajor: user.targetMajor
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data", error });
    }
  });

  // Target schools
  app.get("/api/target-schools", async (req, res) => {
    const userId = "demo-user-id";
    const targetSchools = await storage.getTargetSchoolsByUser(userId);
    res.json(targetSchools);
  });

  app.post("/api/target-schools", async (req, res) => {
    try {
      const targetData = {
        ...req.body,
        userId: "demo-user-id"
      };
      const targetSchool = await storage.createTargetSchool(targetData);

      await storage.createActivityLog({
        userId: "demo-user-id",
        action: "ADD_TARGET_SCHOOL",
        description: `Added target school: ${targetSchool.institutionName}`,
        entityType: "TARGET_SCHOOL",
        entityId: targetSchool.id
      });
      
      res.json(targetSchool);
    } catch (error) {
      res.status(400).json({ message: "Invalid target school data", error });
    }
  });

  app.delete("/api/target-schools/:id", async (req, res) => {
    const deleted = await storage.deleteTargetSchool(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Target school not found" });
    }

    await storage.createActivityLog({
      userId: "demo-user-id",
      action: "DELETE_TARGET_SCHOOL",
      description: "Removed target school",
      entityType: "TARGET_SCHOOL",
      entityId: req.params.id
    });
    
    res.json({ success: true });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    const userId = "demo-user-id";
    const courses = await storage.getCoursesByUser(userId);
    const plans = await storage.getEducationPlansByUser(userId);
    const deadlines = await storage.getDeadlinesByUser(userId);

    const completedCourses = courses.filter(c => c.isCompleted);
    const totalUnits = completedCourses.reduce((sum, c) => sum + (c.units || 0), 0);
    const targetUnits = 60; // Standard transfer requirement

    const stats = {
      completedUnits: totalUnits,
      targetUnits: targetUnits,
      completionPercentage: Math.round((totalUnits / targetUnits) * 100),
      totalCourses: courses.length,
      completedCourses: completedCourses.length,
      activePlans: plans.filter(p => p.isActive).length,
      upcomingDeadlines: deadlines.filter(d => !d.isCompleted && new Date(d.dueDate) > new Date()).length
    };

    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}
