import {
  type Student, type InsertStudent,
  type CurriculumItem, type InsertCurriculumItem,
  type StudentProgress, type InsertProgress,
  type LessonRecord, type InsertLessonRecord,
  type StudentGroup, type InsertStudentGroup,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Student Groups
  getStudentGroups(): Promise<StudentGroup[]>;
  getStudentGroup(id: string): Promise<StudentGroup | undefined>;
  createStudentGroup(group: InsertStudentGroup): Promise<StudentGroup>;
  updateStudentGroup(id: string, group: Partial<InsertStudentGroup>): Promise<StudentGroup | undefined>;
  deleteStudentGroup(id: string): Promise<boolean>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  // Curriculum
  getCurriculumItems(guitarType?: string): Promise<CurriculumItem[]>;
  getCurriculumItem(id: string): Promise<CurriculumItem | undefined>;
  createCurriculumItem(item: InsertCurriculumItem): Promise<CurriculumItem>;
  updateCurriculumItem(id: string, item: Partial<InsertCurriculumItem>): Promise<CurriculumItem | undefined>;
  deleteCurriculumItem(id: string): Promise<boolean>;

  // Progress
  getStudentProgress(studentId: string): Promise<StudentProgress[]>;
  upsertProgress(progress: InsertProgress): Promise<StudentProgress>;

  // Lesson Records
  getLessonRecords(studentId: string): Promise<LessonRecord[]>;
  createLessonRecord(record: InsertLessonRecord): Promise<LessonRecord>;
  deleteLessonRecord(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private studentGroups: Map<string, StudentGroup> = new Map();
  private students: Map<string, Student> = new Map();
  private curriculum: Map<string, CurriculumItem> = new Map();
  private progress: Map<string, StudentProgress> = new Map();
  private lessonRecords: Map<string, LessonRecord> = new Map();

  constructor() {
    this.seedCurriculum();
  }

  private seedCurriculum() {
    const acousticBeginner: Omit<CurriculumItem, "id">[] = [
      { guitarType: "acoustic", category: "기초 이론", title: "기타 각 부분 명칭", description: "헤드, 넥, 바디, 브릿지, 프렛 등 기타 각 부분의 이름과 역할", order: 1, level: "beginner" },
      { guitarType: "acoustic", category: "기초 이론", title: "튜닝 방법", description: "표준 튜닝 (E-A-D-G-B-E), 튜너 사용법", order: 2, level: "beginner" },
      { guitarType: "acoustic", category: "기초 이론", title: "TAB 악보 읽기", description: "TAB 악보의 구조와 읽는 방법", order: 3, level: "beginner" },
      { guitarType: "acoustic", category: "코드", title: "오픈 코드 (C, G, D, Em, Am)", description: "가장 기본이 되는 오픈 코드 5가지", order: 4, level: "beginner" },
      { guitarType: "acoustic", category: "코드", title: "코드 체인지 연습", description: "코드 간 부드러운 전환 연습", order: 5, level: "beginner" },
      { guitarType: "acoustic", category: "스트로크", title: "다운 스트로크", description: "기본 다운 스트로크 패턴", order: 6, level: "beginner" },
      { guitarType: "acoustic", category: "스트로크", title: "업/다운 스트로크", description: "업다운 교차 스트로크 패턴", order: 7, level: "beginner" },
      { guitarType: "acoustic", category: "스트로크", title: "8비트 스트로크 패턴", description: "대중음악에서 가장 많이 사용되는 8비트 패턴", order: 8, level: "beginner" },
      { guitarType: "acoustic", category: "연습곡", title: "첫 번째 연습곡", description: "배운 코드와 스트로크를 활용한 첫 번째 곡", order: 9, level: "beginner" },
      { guitarType: "acoustic", category: "연습곡", title: "두 번째 연습곡", description: "다양한 스트로크 패턴 적용 곡", order: 10, level: "beginner" },
    ];

    const acousticIntermediate: Omit<CurriculumItem, "id">[] = [
      { guitarType: "acoustic", category: "코드", title: "바레 코드 (F, Bm)", description: "바레 코드의 원리와 연습 방법", order: 11, level: "intermediate" },
      { guitarType: "acoustic", category: "코드", title: "세븐스 코드 (7th)", description: "메이저7, 마이너7, 도미넌트7 코드", order: 12, level: "intermediate" },
      { guitarType: "acoustic", category: "스트로크", title: "16비트 스트로크", description: "16비트 리듬 패턴과 고스트 스트로크", order: 13, level: "intermediate" },
      { guitarType: "acoustic", category: "핑거스타일", title: "아르페지오 기초", description: "T-1-2-3 기본 아르페지오 패턴", order: 14, level: "intermediate" },
      { guitarType: "acoustic", category: "핑거스타일", title: "핑거스타일 패턴", description: "다양한 핑거피킹 패턴 연습", order: 15, level: "intermediate" },
      { guitarType: "acoustic", category: "이론", title: "메이저 스케일", description: "C 메이저 스케일의 구조와 운지", order: 16, level: "intermediate" },
      { guitarType: "acoustic", category: "이론", title: "펜타토닉 스케일", description: "마이너 펜타토닉 스케일 5가지 포지션", order: 17, level: "intermediate" },
      { guitarType: "acoustic", category: "테크닉", title: "해머온/풀오프", description: "레가토 테크닉의 기초", order: 18, level: "intermediate" },
      { guitarType: "acoustic", category: "연습곡", title: "핑거스타일 곡", description: "아르페지오를 활용한 발라드 곡", order: 19, level: "intermediate" },
      { guitarType: "acoustic", category: "연습곡", title: "바레코드 활용 곡", description: "바레코드가 포함된 곡 연습", order: 20, level: "intermediate" },
    ];

    const acousticAdvanced: Omit<CurriculumItem, "id">[] = [
      { guitarType: "acoustic", category: "테크닉", title: "슬라이드/벤딩", description: "음의 연결과 표현력 향상 테크닉", order: 21, level: "advanced" },
      { guitarType: "acoustic", category: "테크닉", title: "하모닉스", description: "내추럴/아티피셜 하모닉스", order: 22, level: "advanced" },
      { guitarType: "acoustic", category: "이론", title: "코드 보이싱", description: "다양한 자리 바꿈과 보이싱", order: 23, level: "advanced" },
      { guitarType: "acoustic", category: "이론", title: "키와 조성", description: "키의 이해와 전조", order: 24, level: "advanced" },
      { guitarType: "acoustic", category: "핑거스타일", title: "고급 핑거스타일", description: "퍼커시브 핑거스타일, 텝핑 등", order: 25, level: "advanced" },
    ];

    const electricBeginner: Omit<CurriculumItem, "id">[] = [
      { guitarType: "electric", category: "기초 이론", title: "일렉기타/앰프 구조", description: "일렉기타, 앰프, 이펙터의 기본 구조와 연결", order: 1, level: "beginner" },
      { guitarType: "electric", category: "기초 이론", title: "톤 세팅 기초", description: "볼륨, 톤, 픽업 셀렉터 사용법", order: 2, level: "beginner" },
      { guitarType: "electric", category: "기초 이론", title: "TAB 악보/악보 읽기", description: "TAB 악보와 기본 음표/쉼표 읽기", order: 3, level: "beginner" },
      { guitarType: "electric", category: "피킹", title: "얼터네이트 피킹", description: "다운/업 피킹의 기본과 정확성", order: 4, level: "beginner" },
      { guitarType: "electric", category: "피킹", title: "뮤트 테크닉", description: "팜뮤트와 프렛핸드 뮤트", order: 5, level: "beginner" },
      { guitarType: "electric", category: "코드/리프", title: "파워코드", description: "파워코드의 구조와 활용", order: 6, level: "beginner" },
      { guitarType: "electric", category: "코드/리프", title: "기본 리프 연습", description: "유명 록 리프를 통한 기초 연습", order: 7, level: "beginner" },
      { guitarType: "electric", category: "스케일", title: "크로매틱 연습", description: "왼손 운지력과 오른손 피킹 동기화", order: 8, level: "beginner" },
      { guitarType: "electric", category: "연습곡", title: "첫 번째 록 곡", description: "파워코드와 기본 리프를 활용한 곡", order: 9, level: "beginner" },
      { guitarType: "electric", category: "연습곡", title: "두 번째 연습곡", description: "다양한 피킹 패턴이 포함된 곡", order: 10, level: "beginner" },
    ];

    const electricIntermediate: Omit<CurriculumItem, "id">[] = [
      { guitarType: "electric", category: "스케일", title: "마이너 펜타토닉", description: "5가지 포지션과 연결 패턴", order: 11, level: "intermediate" },
      { guitarType: "electric", category: "스케일", title: "메이저 스케일/모드", description: "메이저 스케일 7가지 포지션", order: 12, level: "intermediate" },
      { guitarType: "electric", category: "테크닉", title: "해머온/풀오프", description: "레가토 주법의 기초", order: 13, level: "intermediate" },
      { guitarType: "electric", category: "테크닉", title: "벤딩/비브라토", description: "감정 표현의 핵심 테크닉", order: 14, level: "intermediate" },
      { guitarType: "electric", category: "테크닉", title: "슬라이드", description: "포지션 이동과 연결", order: 15, level: "intermediate" },
      { guitarType: "electric", category: "솔로", title: "펜타토닉 솔로 기초", description: "펜타토닉을 활용한 솔로 구성", order: 16, level: "intermediate" },
      { guitarType: "electric", category: "이펙터", title: "이펙터 기초", description: "오버드라이브, 디스토션, 딜레이, 리버브 등", order: 17, level: "intermediate" },
      { guitarType: "electric", category: "연습곡", title: "솔로가 있는 곡", description: "중급 수준의 기타 솔로가 포함된 곡", order: 18, level: "intermediate" },
      { guitarType: "electric", category: "연습곡", title: "블루스 곡", description: "12마디 블루스와 셔플 리듬", order: 19, level: "intermediate" },
      { guitarType: "electric", category: "연습곡", title: "펑크/리듬기타 곡", description: "16비트 커팅과 리듬기타 연습", order: 20, level: "intermediate" },
    ];

    const electricAdvanced: Omit<CurriculumItem, "id">[] = [
      { guitarType: "electric", category: "테크닉", title: "스위프 피킹", description: "스위프 아르페지오 연습", order: 21, level: "advanced" },
      { guitarType: "electric", category: "테크닉", title: "태핑", description: "양손 태핑 테크닉", order: 22, level: "advanced" },
      { guitarType: "electric", category: "테크닉", title: "이코노미 피킹", description: "효율적인 피킹 동선", order: 23, level: "advanced" },
      { guitarType: "electric", category: "솔로", title: "모드 활용 솔로", description: "도리안, 믹솔리디안 등 모드 활용", order: 24, level: "advanced" },
      { guitarType: "electric", category: "솔로", title: "즉흥 연주 (잼)", description: "백킹트랙 위 즉흥 솔로 연습", order: 25, level: "advanced" },
      { guitarType: "electric", category: "이론", title: "코드톤 솔로", description: "코드톤을 활용한 솔로 라인 구성", order: 26, level: "advanced" },
      { guitarType: "electric", category: "톤", title: "톤 메이킹", description: "앰프/이펙터 세팅으로 원하는 톤 만들기", order: 27, level: "advanced" },
    ];

    const allItems = [
      ...acousticBeginner, ...acousticIntermediate, ...acousticAdvanced,
      ...electricBeginner, ...electricIntermediate, ...electricAdvanced,
    ];

    allItems.forEach((item) => {
      const id = randomUUID();
      this.curriculum.set(id, { ...item, id });
    });
  }

  // Student Groups
  async getStudentGroups(): Promise<StudentGroup[]> {
    return Array.from(this.studentGroups.values()).sort((a, b) => a.order - b.order);
  }

  async getStudentGroup(id: string): Promise<StudentGroup | undefined> {
    return this.studentGroups.get(id);
  }

  async createStudentGroup(group: InsertStudentGroup): Promise<StudentGroup> {
    const id = randomUUID();
    const newGroup: StudentGroup = { ...group, id };
    this.studentGroups.set(id, newGroup);
    return newGroup;
  }

  async updateStudentGroup(id: string, data: Partial<InsertStudentGroup>): Promise<StudentGroup | undefined> {
    const existing = this.studentGroups.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.studentGroups.set(id, updated);
    return updated;
  }

  async deleteStudentGroup(id: string): Promise<boolean> {
    // Unassign students from deleted group
    for (const [key, student] of this.students) {
      if (student.groupId === id) {
        this.students.set(key, { ...student, groupId: null });
      }
    }
    return this.studentGroups.delete(id);
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const newStudent: Student = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: string, data: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    // Also delete associated progress and lesson records
    for (const [key, p] of this.progress) {
      if (p.studentId === id) this.progress.delete(key);
    }
    for (const [key, r] of this.lessonRecords) {
      if (r.studentId === id) this.lessonRecords.delete(key);
    }
    return this.students.delete(id);
  }

  // Curriculum
  async getCurriculumItems(guitarType?: string): Promise<CurriculumItem[]> {
    const items = Array.from(this.curriculum.values());
    if (guitarType) return items.filter(i => i.guitarType === guitarType);
    return items;
  }

  async getCurriculumItem(id: string): Promise<CurriculumItem | undefined> {
    return this.curriculum.get(id);
  }

  async createCurriculumItem(item: InsertCurriculumItem): Promise<CurriculumItem> {
    const id = randomUUID();
    const newItem: CurriculumItem = { ...item, id };
    this.curriculum.set(id, newItem);
    return newItem;
  }

  async updateCurriculumItem(id: string, data: Partial<InsertCurriculumItem>): Promise<CurriculumItem | undefined> {
    const existing = this.curriculum.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.curriculum.set(id, updated);
    return updated;
  }

  async deleteCurriculumItem(id: string): Promise<boolean> {
    return this.curriculum.delete(id);
  }

  // Progress
  async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.studentId === studentId);
  }

  async upsertProgress(data: InsertProgress): Promise<StudentProgress> {
    // Find existing by studentId + curriculumItemId
    const existing = Array.from(this.progress.values()).find(
      p => p.studentId === data.studentId && p.curriculumItemId === data.curriculumItemId
    );
    if (existing) {
      const updated = { ...existing, ...data };
      this.progress.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const newProgress = { ...data, id } as any;
    this.progress.set(id, newProgress);
    return newProgress;
  }

  // Lesson Records
  async getLessonRecords(studentId: string): Promise<LessonRecord[]> {
    return Array.from(this.lessonRecords.values())
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async createLessonRecord(record: InsertLessonRecord): Promise<LessonRecord> {
    const id = randomUUID();
    const newRecord: LessonRecord = { ...record, id };
    this.lessonRecords.set(id, newRecord);
    return newRecord;
  }

  async deleteLessonRecord(id: string): Promise<boolean> {
    return this.lessonRecords.delete(id);
  }
}

export const storage = new MemStorage();
