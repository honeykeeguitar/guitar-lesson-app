// Supabase-backed storage layer
// Replaces the in-memory version — all data persists in the cloud DB

import { supabase } from "./supabase";

// ---- Curriculum seed data ----
const CURRICULUM_SEED = [
  { guitar_type: "acoustic", category: "기초 이론", title: "기타 각 부분 명칭", description: "헤드, 넥, 바디, 브릿지, 프렛 등 기타 각 부분의 이름과 역할", order: 1, level: "beginner" },
  { guitar_type: "acoustic", category: "기초 이론", title: "튜닝 방법", description: "표준 튜닝 (E-A-D-G-B-E), 튜너 사용법", order: 2, level: "beginner" },
  { guitar_type: "acoustic", category: "기초 이론", title: "TAB 악보 읽기", description: "TAB 악보의 구조와 읽는 방법", order: 3, level: "beginner" },
  { guitar_type: "acoustic", category: "코드", title: "오픈 코드 (C, G, D, Em, Am)", description: "가장 기본이 되는 오픈 코드 5가지", order: 4, level: "beginner" },
  { guitar_type: "acoustic", category: "코드", title: "코드 체인지 연습", description: "코드 간 부드러운 전환 연습", order: 5, level: "beginner" },
  { guitar_type: "acoustic", category: "스트로크", title: "다운 스트로크", description: "기본 다운 스트로크 패턴", order: 6, level: "beginner" },
  { guitar_type: "acoustic", category: "스트로크", title: "업/다운 스트로크", description: "업다운 교차 스트로크 패턴", order: 7, level: "beginner" },
  { guitar_type: "acoustic", category: "스트로크", title: "8비트 스트로크 패턴", description: "대중음악에서 가장 많이 사용되는 8비트 패턴", order: 8, level: "beginner" },
  { guitar_type: "acoustic", category: "연습곡", title: "첫 번째 연습곡", description: "배운 코드와 스트로크를 활용한 첫 번째 곡", order: 9, level: "beginner" },
  { guitar_type: "acoustic", category: "연습곡", title: "두 번째 연습곡", description: "다양한 스트로크 패턴 적용 곡", order: 10, level: "beginner" },
  { guitar_type: "acoustic", category: "코드", title: "바레 코드 (F, Bm)", description: "바레 코드의 원리와 연습 방법", order: 11, level: "intermediate" },
  { guitar_type: "acoustic", category: "코드", title: "세븐스 코드 (7th)", description: "메이저7, 마이너7, 도미넌트7 코드", order: 12, level: "intermediate" },
  { guitar_type: "acoustic", category: "스트로크", title: "16비트 스트로크", description: "16비트 리듬 패턴과 고스트 스트로크", order: 13, level: "intermediate" },
  { guitar_type: "acoustic", category: "핑거스타일", title: "아르페지오 기초", description: "T-1-2-3 기본 아르페지오 패턴", order: 14, level: "intermediate" },
  { guitar_type: "acoustic", category: "핑거스타일", title: "핑거스타일 패턴", description: "다양한 핑거피킹 패턴 연습", order: 15, level: "intermediate" },
  { guitar_type: "acoustic", category: "이론", title: "메이저 스케일", description: "C 메이저 스케일의 구조와 운지", order: 16, level: "intermediate" },
  { guitar_type: "acoustic", category: "이론", title: "펜타토닉 스케일", description: "마이너 펜타토닉 스케일 5가지 포지션", order: 17, level: "intermediate" },
  { guitar_type: "acoustic", category: "테크닉", title: "해머온/풀오프", description: "레가토 테크닉의 기초", order: 18, level: "intermediate" },
  { guitar_type: "acoustic", category: "연습곡", title: "핑거스타일 곡", description: "아르페지오를 활용한 발라드 곡", order: 19, level: "intermediate" },
  { guitar_type: "acoustic", category: "연습곡", title: "바레코드 활용 곡", description: "바레코드가 포함된 곡 연습", order: 20, level: "intermediate" },
  { guitar_type: "acoustic", category: "테크닉", title: "슬라이드/벤딩", description: "음의 연결과 표현력 향상 테크닉", order: 21, level: "advanced" },
  { guitar_type: "acoustic", category: "테크닉", title: "하모닉스", description: "내추럴/아티피셜 하모닉스", order: 22, level: "advanced" },
  { guitar_type: "acoustic", category: "이론", title: "코드 보이싱", description: "다양한 자리 바꿈과 보이싱", order: 23, level: "advanced" },
  { guitar_type: "acoustic", category: "이론", title: "키와 조성", description: "키의 이해와 전조", order: 24, level: "advanced" },
  { guitar_type: "acoustic", category: "핑거스타일", title: "고급 핑거스타일", description: "퍼커시브 핑거스타일, 텝핑 등", order: 25, level: "advanced" },
  { guitar_type: "electric", category: "기초 이론", title: "일렉기타/앰프 구조", description: "일렉기타, 앰프, 이펙터의 기본 구조와 연결", order: 1, level: "beginner" },
  { guitar_type: "electric", category: "기초 이론", title: "톤 세팅 기초", description: "볼륨, 톤, 픽업 셀렉터 사용법", order: 2, level: "beginner" },
  { guitar_type: "electric", category: "기초 이론", title: "TAB 악보/악보 읽기", description: "TAB 악보와 기본 음표/쉼표 읽기", order: 3, level: "beginner" },
  { guitar_type: "electric", category: "피킹", title: "얼터네이트 피킹", description: "다운/업 피킹의 기본과 정확성", order: 4, level: "beginner" },
  { guitar_type: "electric", category: "피킹", title: "뮤트 테크닉", description: "팜뮤트와 프렛핸드 뮤트", order: 5, level: "beginner" },
  { guitar_type: "electric", category: "코드/리프", title: "파워코드", description: "파워코드의 구조와 활용", order: 6, level: "beginner" },
  { guitar_type: "electric", category: "코드/리프", title: "기본 리프 연습", description: "유명 록 리프를 통한 기초 연습", order: 7, level: "beginner" },
  { guitar_type: "electric", category: "스케일", title: "크로매틱 연습", description: "왼손 운지력과 오른손 피킹 동기화", order: 8, level: "beginner" },
  { guitar_type: "electric", category: "연습곡", title: "첫 번째 록 곡", description: "파워코드와 기본 리프를 활용한 곡", order: 9, level: "beginner" },
  { guitar_type: "electric", category: "연습곡", title: "두 번째 연습곡", description: "다양한 피킹 패턴이 포함된 곡", order: 10, level: "beginner" },
  { guitar_type: "electric", category: "스케일", title: "마이너 펜타토닉", description: "5가지 포지션과 연결 패턴", order: 11, level: "intermediate" },
  { guitar_type: "electric", category: "스케일", title: "메이저 스케일/모드", description: "메이저 스케일 7가지 포지션", order: 12, level: "intermediate" },
  { guitar_type: "electric", category: "테크닉", title: "해머온/풀오프", description: "레가토 주법의 기초", order: 13, level: "intermediate" },
  { guitar_type: "electric", category: "테크닉", title: "벤딩/비브라토", description: "감정 표현의 핵심 테크닉", order: 14, level: "intermediate" },
  { guitar_type: "electric", category: "테크닉", title: "슬라이드", description: "포지션 이동과 연결", order: 15, level: "intermediate" },
  { guitar_type: "electric", category: "솔로", title: "펜타토닉 솔로 기초", description: "펜타토닉을 활용한 솔로 구성", order: 16, level: "intermediate" },
  { guitar_type: "electric", category: "이펙터", title: "이펙터 기초", description: "오버드라이브, 디스토션, 딜레이, 리버브 등", order: 17, level: "intermediate" },
  { guitar_type: "electric", category: "연습곡", title: "솔로가 있는 곡", description: "중급 수준의 기타 솔로가 포함된 곡", order: 18, level: "intermediate" },
  { guitar_type: "electric", category: "연습곡", title: "블루스 곡", description: "12마디 블루스와 셔플 리듬", order: 19, level: "intermediate" },
  { guitar_type: "electric", category: "연습곡", title: "펑크/리듬기타 곡", description: "16비트 커팅과 리듬기타 연습", order: 20, level: "intermediate" },
  { guitar_type: "electric", category: "테크닉", title: "스위프 피킹", description: "스위프 아르페지오 연습", order: 21, level: "advanced" },
  { guitar_type: "electric", category: "테크닉", title: "태핑", description: "양손 태핑 테크닉", order: 22, level: "advanced" },
  { guitar_type: "electric", category: "테크닉", title: "이코노미 피킹", description: "효율적인 피킹 동선", order: 23, level: "advanced" },
  { guitar_type: "electric", category: "솔로", title: "모드 활용 솔로", description: "도리안, 믹솔리디안 등 모드 활용", order: 24, level: "advanced" },
  { guitar_type: "electric", category: "솔로", title: "즉흥 연주 (잼)", description: "백킹트랙 위 즉흥 솔로 연습", order: 25, level: "advanced" },
  { guitar_type: "electric", category: "이론", title: "코드톤 솔로", description: "코드톤을 활용한 솔로 라인 구성", order: 26, level: "advanced" },
  { guitar_type: "electric", category: "톤", title: "톤 메이킹", description: "앰프/이펙터 세팅으로 원하는 톤 만들기", order: 27, level: "advanced" },
];

// Seed curriculum if table is empty (runs once on first load)
async function seedCurriculumIfEmpty() {
  const { count } = await supabase.from("curriculum_items").select("*", { count: "exact", head: true });
  if (count === 0 || count === null) {
    await supabase.from("curriculum_items").insert(CURRICULUM_SEED);
  }
}

// Fire-and-forget seed on module load
seedCurriculumIfEmpty();

// ---- Helper: map DB rows (snake_case) ↔ app objects (camelCase) ----
function toStudent(row: any) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    guitarType: row.guitar_type,
    level: row.level,
    startDate: row.start_date,
    notes: row.notes,
    avatarColor: row.avatar_color,
    groupId: row.group_id,
  };
}

function toStudentDb(data: any) {
  const out: any = {};
  if (data.name !== undefined) out.name = data.name;
  if (data.phone !== undefined) out.phone = data.phone;
  if (data.guitarType !== undefined) out.guitar_type = data.guitarType;
  if (data.level !== undefined) out.level = data.level;
  if (data.startDate !== undefined) out.start_date = data.startDate;
  if (data.notes !== undefined) out.notes = data.notes;
  if (data.avatarColor !== undefined) out.avatar_color = data.avatarColor;
  if (data.groupId !== undefined) out.group_id = data.groupId;
  return out;
}

function toCurriculum(row: any) {
  return {
    id: row.id,
    guitarType: row.guitar_type,
    category: row.category,
    title: row.title,
    description: row.description,
    order: row.order,
    level: row.level,
  };
}

function toCurriculumDb(data: any) {
  const out: any = {};
  if (data.guitarType !== undefined) out.guitar_type = data.guitarType;
  if (data.category !== undefined) out.category = data.category;
  if (data.title !== undefined) out.title = data.title;
  if (data.description !== undefined) out.description = data.description;
  if (data.order !== undefined) out.order = data.order;
  if (data.level !== undefined) out.level = data.level;
  return out;
}

function toProgress(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    curriculumItemId: row.curriculum_item_id,
    status: row.status,
    completedDate: row.completed_date,
    notes: row.notes,
  };
}

function toLesson(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    duration: row.duration,
    topics: row.topics,
    homework: row.homework,
    notes: row.notes,
  };
}

function toGroup(row: any) {
  return { id: row.id, name: row.name, color: row.color, order: row.order };
}

// ---- Route handler (same interface as before) ----
type RouteHandler = (params: Record<string, string>, query: Record<string, string>, body?: any) => Promise<any>;

const routes: { method: string; pattern: RegExp; paramNames: string[]; handler: RouteHandler }[] = [];

function addRoute(method: string, path: string, handler: RouteHandler) {
  const paramNames: string[] = [];
  const patternStr = path.replace(/:(\w+)/g, (_m, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  routes.push({ method, pattern: new RegExp(`^${patternStr}$`), paramNames, handler });
}

// ---- Groups ----
addRoute("GET", "/api/groups", async () => {
  const { data, error } = await supabase.from("student_groups").select("*").order("order");
  if (error) throw error;
  return (data || []).map(toGroup);
});

addRoute("POST", "/api/groups", async (_p, _q, body) => {
  const { data, error } = await supabase.from("student_groups").insert({
    name: body.name, color: body.color, order: body.order ?? 0,
  }).select().single();
  if (error) throw error;
  return toGroup(data);
});

addRoute("PATCH", "/api/groups/:id", async (p, _q, body) => {
  const update: any = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.color !== undefined) update.color = body.color;
  if (body.order !== undefined) update.order = body.order;
  const { data, error } = await supabase.from("student_groups").update(update).eq("id", p.id).select().single();
  if (error) throw error;
  return toGroup(data);
});

addRoute("DELETE", "/api/groups/:id", async (p) => {
  // Unassign students first
  await supabase.from("students").update({ group_id: null }).eq("group_id", p.id);
  const { error } = await supabase.from("student_groups").delete().eq("id", p.id);
  if (error) throw error;
  return { success: true };
});

// ---- Students ----
addRoute("GET", "/api/students", async () => {
  const { data, error } = await supabase.from("students").select("*");
  if (error) throw error;
  return (data || []).map(toStudent);
});

addRoute("GET", "/api/students/:id", async (p) => {
  const { data, error } = await supabase.from("students").select("*").eq("id", p.id).single();
  if (error) throw error;
  return toStudent(data);
});

addRoute("POST", "/api/students", async (_p, _q, body) => {
  const { data, error } = await supabase.from("students").insert(toStudentDb(body)).select().single();
  if (error) throw error;
  return toStudent(data);
});

addRoute("PATCH", "/api/students/:id", async (p, _q, body) => {
  const { data, error } = await supabase.from("students").update(toStudentDb(body)).eq("id", p.id).select().single();
  if (error) throw error;
  return toStudent(data);
});

addRoute("DELETE", "/api/students/:id", async (p) => {
  // Cascading deletes handled by DB foreign keys
  const { error } = await supabase.from("students").delete().eq("id", p.id);
  if (error) throw error;
  return { success: true };
});

// ---- Curriculum ----
addRoute("GET", "/api/curriculum", async (_p, q) => {
  let query = supabase.from("curriculum_items").select("*");
  if (q.guitarType) query = query.eq("guitar_type", q.guitarType);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCurriculum);
});

addRoute("POST", "/api/curriculum", async (_p, _q, body) => {
  const { data, error } = await supabase.from("curriculum_items").insert(toCurriculumDb(body)).select().single();
  if (error) throw error;
  return toCurriculum(data);
});

addRoute("PATCH", "/api/curriculum/:id", async (p, _q, body) => {
  const { data, error } = await supabase.from("curriculum_items").update(toCurriculumDb(body)).eq("id", p.id).select().single();
  if (error) throw error;
  return toCurriculum(data);
});

addRoute("DELETE", "/api/curriculum/:id", async (p) => {
  const { error } = await supabase.from("curriculum_items").delete().eq("id", p.id);
  if (error) throw error;
  return { success: true };
});

// ---- Progress ----
addRoute("GET", "/api/students/:studentId/progress", async (p) => {
  const { data, error } = await supabase.from("student_progress").select("*").eq("student_id", p.studentId);
  if (error) throw error;
  return (data || []).map(toProgress);
});

addRoute("POST", "/api/progress", async (_p, _q, body) => {
  // Upsert by student_id + curriculum_item_id
  const { data, error } = await supabase.from("student_progress").upsert({
    student_id: body.studentId,
    curriculum_item_id: body.curriculumItemId,
    status: body.status,
    completed_date: body.completedDate,
    notes: body.notes,
  }, { onConflict: "student_id,curriculum_item_id" }).select().single();
  if (error) throw error;
  return toProgress(data);
});

// ---- Lesson Records ----
addRoute("GET", "/api/students/:studentId/lessons", async (p) => {
  const { data, error } = await supabase.from("lesson_records").select("*")
    .eq("student_id", p.studentId).order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map(toLesson);
});

addRoute("POST", "/api/lessons", async (_p, _q, body) => {
  const { data, error } = await supabase.from("lesson_records").insert({
    student_id: body.studentId,
    date: body.date,
    duration: body.duration,
    topics: body.topics,
    homework: body.homework,
    notes: body.notes,
  }).select().single();
  if (error) throw error;
  return toLesson(data);
});

addRoute("DELETE", "/api/lessons/:id", async (p) => {
  const { error } = await supabase.from("lesson_records").delete().eq("id", p.id);
  if (error) throw error;
  return { success: true };
});

// ---- Request dispatcher (now async) ----
export async function handleRequest(method: string, url: string, body?: any): Promise<{ status: number; data: any }> {
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
      const result = await route.handler(params, query, body);
      return { status: method === "POST" ? 201 : 200, data: result };
    } catch (e: any) {
      console.error("API Error:", e);
      if (e.code === "PGRST116") return { status: 404, data: { message: "Not found" } };
      return { status: 500, data: { message: e.message } };
    }
  }

  return { status: 404, data: { message: "Route not found" } };
}
