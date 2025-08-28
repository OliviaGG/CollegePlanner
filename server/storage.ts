import { 
  type User, type InsertUser,
  type Institution, type InsertInstitution,
  type Course, type InsertCourse,
  type EducationPlan, type InsertEducationPlan,
  type PlannedSemester, type InsertPlannedSemester,
  type Document, type InsertDocument,
  type ArticulationAgreement, type InsertArticulationAgreement,
  type Deadline, type InsertDeadline,
  type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Institution methods
  getInstitutions(): Promise<Institution[]>;
  getInstitution(id: string): Promise<Institution | undefined>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;

  // Course methods
  getCoursesByUser(userId: string): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Education Plan methods
  getEducationPlansByUser(userId: string): Promise<EducationPlan[]>;
  getEducationPlan(id: string): Promise<EducationPlan | undefined>;
  createEducationPlan(plan: InsertEducationPlan): Promise<EducationPlan>;
  updateEducationPlan(id: string, updates: Partial<InsertEducationPlan>): Promise<EducationPlan | undefined>;
  deleteEducationPlan(id: string): Promise<boolean>;

  // Planned Semester methods
  getPlannedSemestersByPlan(planId: string): Promise<PlannedSemester[]>;
  createPlannedSemester(semester: InsertPlannedSemester): Promise<PlannedSemester>;
  updatePlannedSemester(id: string, updates: Partial<InsertPlannedSemester>): Promise<PlannedSemester | undefined>;
  deletePlannedSemester(id: string): Promise<boolean>;

  // Document methods
  getDocumentsByUser(userId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;

  // Articulation Agreement methods
  getArticulationAgreementsByUser(userId: string): Promise<ArticulationAgreement[]>;
  createArticulationAgreement(agreement: InsertArticulationAgreement): Promise<ArticulationAgreement>;

  // Deadline methods
  getDeadlinesByUser(userId: string): Promise<Deadline[]>;
  createDeadline(deadline: InsertDeadline): Promise<Deadline>;
  updateDeadline(id: string, updates: Partial<InsertDeadline>): Promise<Deadline | undefined>;

  // Activity Log methods
  getActivityLogByUser(userId: string): Promise<ActivityLog[]>;
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private institutions: Map<string, Institution>;
  private courses: Map<string, Course>;
  private educationPlans: Map<string, EducationPlan>;
  private plannedSemesters: Map<string, PlannedSemester>;
  private documents: Map<string, Document>;
  private articulationAgreements: Map<string, ArticulationAgreement>;
  private deadlines: Map<string, Deadline>;
  private activityLogs: Map<string, ActivityLog>;

  constructor() {
    this.users = new Map();
    this.institutions = new Map();
    this.courses = new Map();
    this.educationPlans = new Map();
    this.plannedSemesters = new Map();
    this.documents = new Map();
    this.articulationAgreements = new Map();
    this.deadlines = new Map();
    this.activityLogs = new Map();

    // Seed with California institutions
    this.seedInstitutions();
  }

  private seedInstitutions() {
    const californiaInstitutions: InsertInstitution[] = [
      { name: "Sacramento City College", type: "CCC", assistOrgId: "SCC", abbreviation: "SCC" },
      { name: "University of California, Davis", type: "UC", assistOrgId: "76", abbreviation: "UCD" },
      { name: "University of California, Berkeley", type: "UC", assistOrgId: "77", abbreviation: "UCB" },
      { name: "University of California, Los Angeles", type: "UC", assistOrgId: "78", abbreviation: "UCLA" },
      { name: "California State University, Sacramento", type: "CSU", assistOrgId: "138", abbreviation: "CSUS" },
      { name: "San Francisco State University", type: "CSU", assistOrgId: "139", abbreviation: "SFSU" },
      { name: "Cal Poly San Luis Obispo", type: "CSU", assistOrgId: "140", abbreviation: "CPSLO" },
    ];

    californiaInstitutions.forEach(inst => {
      const id = randomUUID();
      this.institutions.set(id, { ...inst, id });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Institution methods
  async getInstitutions(): Promise<Institution[]> {
    return Array.from(this.institutions.values());
  }

  async getInstitution(id: string): Promise<Institution | undefined> {
    return this.institutions.get(id);
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const id = randomUUID();
    const institution: Institution = { ...insertInstitution, id };
    this.institutions.set(id, institution);
    return institution;
  }

  // Course methods
  async getCoursesByUser(userId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.userId === userId);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    const updatedCourse = { ...course, ...updates };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Education Plan methods
  async getEducationPlansByUser(userId: string): Promise<EducationPlan[]> {
    return Array.from(this.educationPlans.values()).filter(plan => plan.userId === userId);
  }

  async getEducationPlan(id: string): Promise<EducationPlan | undefined> {
    return this.educationPlans.get(id);
  }

  async createEducationPlan(insertPlan: InsertEducationPlan): Promise<EducationPlan> {
    const id = randomUUID();
    const plan: EducationPlan = { 
      ...insertPlan, 
      id, 
      createdAt: new Date() 
    };
    this.educationPlans.set(id, plan);
    return plan;
  }

  async updateEducationPlan(id: string, updates: Partial<InsertEducationPlan>): Promise<EducationPlan | undefined> {
    const plan = this.educationPlans.get(id);
    if (!plan) return undefined;
    const updatedPlan = { ...plan, ...updates };
    this.educationPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteEducationPlan(id: string): Promise<boolean> {
    return this.educationPlans.delete(id);
  }

  // Planned Semester methods
  async getPlannedSemestersByPlan(planId: string): Promise<PlannedSemester[]> {
    return Array.from(this.plannedSemesters.values()).filter(semester => semester.planId === planId);
  }

  async createPlannedSemester(insertSemester: InsertPlannedSemester): Promise<PlannedSemester> {
    const id = randomUUID();
    const semester: PlannedSemester = { ...insertSemester, id };
    this.plannedSemesters.set(id, semester);
    return semester;
  }

  async updatePlannedSemester(id: string, updates: Partial<InsertPlannedSemester>): Promise<PlannedSemester | undefined> {
    const semester = this.plannedSemesters.get(id);
    if (!semester) return undefined;
    const updatedSemester = { ...semester, ...updates };
    this.plannedSemesters.set(id, updatedSemester);
    return updatedSemester;
  }

  async deletePlannedSemester(id: string): Promise<boolean> {
    return this.plannedSemesters.delete(id);
  }

  // Document methods
  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadedAt: new Date() 
    };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Articulation Agreement methods
  async getArticulationAgreementsByUser(userId: string): Promise<ArticulationAgreement[]> {
    return Array.from(this.articulationAgreements.values()).filter(agreement => agreement.userId === userId);
  }

  async createArticulationAgreement(insertAgreement: InsertArticulationAgreement): Promise<ArticulationAgreement> {
    const id = randomUUID();
    const agreement: ArticulationAgreement = { 
      ...insertAgreement, 
      id, 
      createdAt: new Date() 
    };
    this.articulationAgreements.set(id, agreement);
    return agreement;
  }

  // Deadline methods
  async getDeadlinesByUser(userId: string): Promise<Deadline[]> {
    return Array.from(this.deadlines.values()).filter(deadline => deadline.userId === userId);
  }

  async createDeadline(insertDeadline: InsertDeadline): Promise<Deadline> {
    const id = randomUUID();
    const deadline: Deadline = { ...insertDeadline, id };
    this.deadlines.set(id, deadline);
    return deadline;
  }

  async updateDeadline(id: string, updates: Partial<InsertDeadline>): Promise<Deadline | undefined> {
    const deadline = this.deadlines.get(id);
    if (!deadline) return undefined;
    const updatedDeadline = { ...deadline, ...updates };
    this.deadlines.set(id, updatedDeadline);
    return updatedDeadline;
  }

  // Activity Log methods
  async getActivityLogByUser(userId: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createActivityLog(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const activity: ActivityLog = { 
      ...insertActivity, 
      id, 
      timestamp: new Date() 
    };
    this.activityLogs.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
