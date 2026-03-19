import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students
export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  guitarType: text("guitar_type").notNull(), // "acoustic" | "electric" | "both"
  level: text("level").notNull(), // "beginner" | "intermediate" | "advanced"
  startDate: text("start_date").notNull(),
  notes: text("notes"),
  avatarColor: text("avatar_color").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Curriculum templates
export const curriculumItems = pgTable("curriculum_items", {
  id: varchar("id").primaryKey(),
  guitarType: text("guitar_type").notNull(), // "acoustic" | "electric"
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  level: text("level").notNull(), // "beginner" | "intermediate" | "advanced"
});

export const insertCurriculumItemSchema = createInsertSchema(curriculumItems).omit({ id: true });
export type InsertCurriculumItem = z.infer<typeof insertCurriculumItemSchema>;
export type CurriculumItem = typeof curriculumItems.$inferSelect;

// Student progress
export const studentProgress = pgTable("student_progress", {
  id: varchar("id").primaryKey(),
  studentId: varchar("student_id").notNull(),
  curriculumItemId: varchar("curriculum_item_id").notNull(),
  status: text("status").notNull(), // "not_started" | "in_progress" | "completed"
  completedDate: text("completed_date"),
  notes: text("notes"),
});

export const insertProgressSchema = createInsertSchema(studentProgress).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;

// Lesson records
export const lessonRecords = pgTable("lesson_records", {
  id: varchar("id").primaryKey(),
  studentId: varchar("student_id").notNull(),
  date: text("date").notNull(),
  duration: integer("duration").notNull(), // minutes
  topics: text("topics").notNull(),
  homework: text("homework"),
  notes: text("notes"),
});

export const insertLessonRecordSchema = createInsertSchema(lessonRecords).omit({ id: true });
export type InsertLessonRecord = z.infer<typeof insertLessonRecordSchema>;
export type LessonRecord = typeof lessonRecords.$inferSelect;
