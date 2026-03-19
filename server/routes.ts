import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Student Groups
  app.get("/api/groups", async (_req, res) => {
    const groups = await storage.getStudentGroups();
    res.json(groups);
  });

  app.post("/api/groups", async (req, res) => {
    const group = await storage.createStudentGroup(req.body);
    res.status(201).json(group);
  });

  app.patch("/api/groups/:id", async (req, res) => {
    const group = await storage.updateStudentGroup(req.params.id, req.body);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  });

  app.delete("/api/groups/:id", async (req, res) => {
    const deleted = await storage.deleteStudentGroup(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.json({ success: true });
  });

  // Students
  app.get("/api/students", async (_req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  app.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.post("/api/students", async (req, res) => {
    const student = await storage.createStudent(req.body);
    res.status(201).json(student);
  });

  app.patch("/api/students/:id", async (req, res) => {
    const student = await storage.updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.delete("/api/students/:id", async (req, res) => {
    const deleted = await storage.deleteStudent(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ success: true });
  });

  // Curriculum
  app.get("/api/curriculum", async (req, res) => {
    const guitarType = req.query.guitarType as string | undefined;
    const items = await storage.getCurriculumItems(guitarType);
    res.json(items);
  });

  app.post("/api/curriculum", async (req, res) => {
    const item = await storage.createCurriculumItem(req.body);
    res.status(201).json(item);
  });

  app.patch("/api/curriculum/:id", async (req, res) => {
    const item = await storage.updateCurriculumItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  });

  app.delete("/api/curriculum/:id", async (req, res) => {
    const deleted = await storage.deleteCurriculumItem(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ success: true });
  });

  // Progress
  app.get("/api/students/:studentId/progress", async (req, res) => {
    const progress = await storage.getStudentProgress(req.params.studentId);
    res.json(progress);
  });

  app.post("/api/progress", async (req, res) => {
    const progress = await storage.upsertProgress(req.body);
    res.json(progress);
  });

  // Lesson Records
  app.get("/api/students/:studentId/lessons", async (req, res) => {
    const records = await storage.getLessonRecords(req.params.studentId);
    res.json(records);
  });

  app.post("/api/lessons", async (req, res) => {
    const record = await storage.createLessonRecord(req.body);
    res.status(201).json(record);
  });

  app.delete("/api/lessons/:id", async (req, res) => {
    const deleted = await storage.deleteLessonRecord(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ success: true });
  });

  return httpServer;
}
