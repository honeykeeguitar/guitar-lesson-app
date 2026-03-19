// Client-side in-memory storage that replaces the server API
// Data persists in browser memory during the session

function uuid() {
  return crypto.randomUUID();
}

interface StudentGroup {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface Student {
  id: string;
  name: string;
  phone: string | null;
  guitarType: string;
  level: string;
  startDate: string;
  notes: string | null;
  avatarColor: string;
  groupId: string | null;
}

interface CurriculumItem {
  id: string;
  guitarType: string;
  category: string;
  title: string;
  description: string | null;
  order: number;
  level: string;
}

interface StudentProgress {
  id: string;
  studentId: string;
  curriculumItemId: string;
  status: string;
  completedDate: string | null;
  notes: string | null;
}

interface LessonRecord {
  id: string;
  studentId: string;
  date: string;
  duration: number;
  topics: string;
  homework: string | null;
  notes: string | null;
}

// ---- Storage maps ----
const groups = new Map<string, StudentGroup>();
const students = new Map<string, Student>();
const curriculum = new Map<string, CurriculumItem>();
const progress = new Map<string, StudentProgress>();
const lessonRecords = new Map<string, LessonRecord>();

// ---- Seed curriculum ----
function seedCurriculum() {
  const acousticBeginner = [
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

  const acousticIntermediate = [
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

  const acousticAdvanced = [
    { guitarType: "acoustic", category: "테크닉", title: "슬라이드/벤딩", description: "음의 연결과 표현력 향상 테크닉", order: 21, level: "advanced" },
    { guitarType: "acoustic", category: "테크닉", title: "하모닉스", description: "내추럴/아티피셜 하모닉스", order: 22, level: "advanced" },
    { guitarType: "acoustic", category: "이론", title: "코드 보이싱", description: "다양한 자리 바꿈과 보이싱", order: 23, level: "advanced" },
    { guitarType: "acoustic", category: "이론", title: "키와 조성", description: "키의 이해와 전조", order: 24, level: "advanced" },
    { guitarType: "acoustic", category: "핑거스타일", title: "고급 핑거스타일", description: "퍼커시브 핑거스타일, 텝핑 등", order: 25, level: "advanced" },
  ];

  const electricBeginner = [
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

  const electricIntermediate = [
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

  const electricAdvanced = [
    { guitarType: "electric", category: "테크닉", title: "스위프 피킹", description: "스위프 아르페지오 연습", order: 21, level: "advanced" },
    { guitarType: "electric", category: "테크닉", title: "태핑", description: "양손 태핑 테크닉", order: 22, level: "advanced" },
    { guitarType: "electric", category: "테크닉", title: "이코노미 피킹", description: "효율적인 피킹 동선", order: 23, level: "advanced" },
    { guitarType: "electric", category: "솔로", title: "모드 활용 솔로", description: "도리안, 믹솔리디안 등 모드 활용", order: 24, level: "advanced" },
    { guitarType: "electric", category: "솔로", title: "즉흥 연주 (잼)", description: "백킹트랙 위 즉흥 솔로 연습", order: 25, level: "advanced" },
    { guitarType: "electric", category: "이론", title: "코드톤 솔로", description: "코드톤을 활용한 솔로 라인 구성", order: 26, level: "advanced" },
    { guitarType: "electric", category: "톤", title: "톤 메이킹", description: "앰프/이펙터 세팅으로 원하는 톤 만들기", order: 27, level: "advanced" },
  ];

  const all = [
    ...acousticBeginner, ...acousticIntermediate, ...acousticAdvanced,
    ...electricBeginner, ...electricIntermediate, ...electricAdvanced,
  ];

  all.forEach((item) => {
    const id = uuid();
    curriculum.set(id, { ...item, id });
  });
}

seedCurriculum();

// ---- Route handler ----
type RouteHandler = (params: Record<string, string>, query: Record<string, string>, body?: any) => any;

const routes: { method: string; pattern: RegExp; paramNames: string[]; handler: RouteHandler }[] = [];

function addRoute(method: string, path: string, handler: RouteHandler) {
  const paramNames: string[] = [];
  const patternStr = path.replace(/:(\w+)/g, (_m, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  routes.push({ method, pattern: new RegExp(`^${patternStr}$`), paramNames, handler });
}

// Groups
addRoute("GET", "/api/groups", () => {
  return Array.from(groups.values()).sort((a, b) => a.order - b.order);
});

addRoute("POST", "/api/groups", (_p, _q, body) => {
  const id = uuid();
  const g: StudentGroup = { ...body, id };
  groups.set(id, g);
  return g;
});

addRoute("PATCH", "/api/groups/:id", (p, _q, body) => {
  const existing = groups.get(p.id);
  if (!existing) throw new Error("404");
  const updated = { ...existing, ...body };
  groups.set(p.id, updated);
  return updated;
});

addRoute("DELETE", "/api/groups/:id", (p) => {
  for (const [key, s] of students) {
    if (s.groupId === p.id) students.set(key, { ...s, groupId: null });
  }
  groups.delete(p.id);
  return { success: true };
});

// Students
addRoute("GET", "/api/students", () => {
  return Array.from(students.values());
});

addRoute("GET", "/api/students/:id", (p) => {
  const s = students.get(p.id);
  if (!s) throw new Error("404");
  return s;
});

addRoute("POST", "/api/students", (_p, _q, body) => {
  const id = uuid();
  const s: Student = { ...body, id };
  students.set(id, s);
  return s;
});

addRoute("PATCH", "/api/students/:id", (p, _q, body) => {
  const existing = students.get(p.id);
  if (!existing) throw new Error("404");
  const updated = { ...existing, ...body };
  students.set(p.id, updated);
  return updated;
});

addRoute("DELETE", "/api/students/:id", (p) => {
  for (const [key, pr] of progress) {
    if (pr.studentId === p.id) progress.delete(key);
  }
  for (const [key, lr] of lessonRecords) {
    if (lr.studentId === p.id) lessonRecords.delete(key);
  }
  students.delete(p.id);
  return { success: true };
});

// Curriculum
addRoute("GET", "/api/curriculum", (_p, q) => {
  const items = Array.from(curriculum.values());
  if (q.guitarType) return items.filter(i => i.guitarType === q.guitarType);
  return items;
});

addRoute("POST", "/api/curriculum", (_p, _q, body) => {
  const id = uuid();
  const item: CurriculumItem = { ...body, id };
  curriculum.set(id, item);
  return item;
});

addRoute("PATCH", "/api/curriculum/:id", (p, _q, body) => {
  const existing = curriculum.get(p.id);
  if (!existing) throw new Error("404");
  const updated = { ...existing, ...body };
  curriculum.set(p.id, updated);
  return updated;
});

addRoute("DELETE", "/api/curriculum/:id", (p) => {
  curriculum.delete(p.id);
  return { success: true };
});

// Progress
addRoute("GET", "/api/students/:studentId/progress", (p) => {
  return Array.from(progress.values()).filter(pr => pr.studentId === p.studentId);
});

addRoute("POST", "/api/progress", (_p, _q, body) => {
  const existing = Array.from(progress.values()).find(
    pr => pr.studentId === body.studentId && pr.curriculumItemId === body.curriculumItemId
  );
  if (existing) {
    const updated = { ...existing, ...body };
    progress.set(existing.id, updated);
    return updated;
  }
  const id = uuid();
  const newP = { ...body, id };
  progress.set(id, newP);
  return newP;
});

// Lesson Records
addRoute("GET", "/api/students/:studentId/lessons", (p) => {
  return Array.from(lessonRecords.values())
    .filter(r => r.studentId === p.studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
});

addRoute("POST", "/api/lessons", (_p, _q, body) => {
  const id = uuid();
  const rec: LessonRecord = { ...body, id };
  lessonRecords.set(id, rec);
  return rec;
});

addRoute("DELETE", "/api/lessons/:id", (p) => {
  lessonRecords.delete(p.id);
  return { success: true };
});

// ---- Request dispatcher ----
export function handleRequest(method: string, url: string, body?: any): { status: number; data: any } {
  const [pathname, queryString] = url.split("?");
  const query: Record<string, string> = {};
  if (queryString) {
    for (const pair of queryString.split("&")) {
      const [k, v] = pair.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
  }

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = pathname.match(route.pattern);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });
    try {
      const result = route.handler(params, query, body);
      return { status: method === "POST" ? 201 : 200, data: result };
    } catch (e: any) {
      if (e.message === "404") return { status: 404, data: { message: "Not found" } };
      return { status: 500, data: { message: e.message } };
    }
  }

  return { status: 404, data: { message: "Route not found" } };
}
