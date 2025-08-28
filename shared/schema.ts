import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp, array } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  currentInstitution: text("current_institution"),
  targetMajor: text("target_major"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Institutions table
export const institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "CCC", "UC", "CSU", "PRIVATE"
  assistOrgId: text("assist_org_id"), // ID from Assist.org API
  abbreviation: text("abbreviation"),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  units: integer("units").notNull(),
  description: text("description"),
  institutionId: varchar("institution_id").references(() => institutions.id),
  category: text("category"), // "GENERAL_ED", "MAJOR_PREP", "ELECTIVE"
  subcategory: text("subcategory"), // "MATH", "ENGLISH", "SCIENCE", etc.
  prerequisites: text("prerequisites").array(),
  isCompleted: boolean("is_completed").default(false),
  grade: text("grade"),
  semesterTaken: text("semester_taken"),
  yearTaken: integer("year_taken"),
  transfersTo: jsonb("transfers_to"), // Array of transfer agreements
});

// Education Plans table
export const educationPlans = pgTable("education_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  targetInstitution: varchar("target_institution_id").references(() => institutions.id),
  targetMajor: text("target_major"),
  targetTransferDate: timestamp("target_transfer_date"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Planned Semesters table
export const plannedSemesters = pgTable("planned_semesters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").references(() => educationPlans.id).notNull(),
  term: text("term").notNull(), // "SPRING", "SUMMER", "FALL"
  year: integer("year").notNull(),
  courseIds: text("course_ids").array(),
  totalUnits: integer("total_units").default(0),
  isCompleted: boolean("is_completed").default(false),
});

// Documents table for uploaded files
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), // "TRANSCRIPT", "DEGREE_AUDIT", "ARTICULATION_AGREEMENT"
  extractedText: text("extracted_text"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Assist.org Articulation Agreements
export const articulationAgreements = pgTable("articulation_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sendingInstitutionId: varchar("sending_institution_id").references(() => institutions.id).notNull(),
  receivingInstitutionId: varchar("receiving_institution_id").references(() => institutions.id).notNull(),
  academicYear: text("academic_year").notNull(),
  major: text("major"),
  sourceType: text("source_type").notNull(), // "MANUAL", "API", "UPLOAD"
  agreementData: jsonb("agreement_data"), // Structured agreement data
  assistOrgKey: text("assist_org_key"), // Key from Assist.org API
  createdAt: timestamp("created_at").defaultNow(),
});

// Deadlines table
export const deadlines = pgTable("deadlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  type: text("type").notNull(), // "REGISTRATION", "APPLICATION", "FINANCIAL_AID"
  priority: text("priority").notNull(), // "HIGH", "MEDIUM", "LOW"
  isCompleted: boolean("is_completed").default(false),
});

// Activity Log table
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type"), // "COURSE", "PLAN", "DOCUMENT", etc.
  entityId: varchar("entity_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Target Schools table
export const targetSchools = pgTable("target_schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  institutionId: varchar("institution_id").references(() => institutions.id).notNull(),
  institutionName: text("institution_name").notNull(),
  major: text("major").notNull(),
  targetDate: timestamp("target_date").notNull(),
  priority: text("priority").notNull(), // "HIGH", "MEDIUM", "LOW"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertEducationPlanSchema = createInsertSchema(educationPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPlannedSemesterSchema = createInsertSchema(plannedSemesters).omit({
  id: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertArticulationAgreementSchema = createInsertSchema(articulationAgreements).omit({
  id: true,
  createdAt: true,
});

export const insertDeadlineSchema = createInsertSchema(deadlines).omit({
  id: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  timestamp: true,
});

export const insertTargetSchoolSchema = createInsertSchema(targetSchools).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type EducationPlan = typeof educationPlans.$inferSelect;
export type InsertEducationPlan = z.infer<typeof insertEducationPlanSchema>;

export type PlannedSemester = typeof plannedSemesters.$inferSelect;
export type InsertPlannedSemester = z.infer<typeof insertPlannedSemesterSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ArticulationAgreement = typeof articulationAgreements.$inferSelect;
export type InsertArticulationAgreement = z.infer<typeof insertArticulationAgreementSchema>;

export type Deadline = typeof deadlines.$inferSelect;
export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type TargetSchool = typeof targetSchools.$inferSelect;
export type InsertTargetSchool = z.infer<typeof insertTargetSchoolSchema>;
