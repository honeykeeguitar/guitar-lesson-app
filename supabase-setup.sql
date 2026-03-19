-- ============================================
-- 기타 레슨 관리 앱 - Supabase 테이블 생성
-- Supabase 대시보드 > SQL Editor에서 실행하세요
-- ============================================

-- 학생 그룹
CREATE TABLE IF NOT EXISTS student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- 학생
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  guitar_type TEXT NOT NULL,
  level TEXT NOT NULL,
  start_date TEXT NOT NULL,
  notes TEXT,
  avatar_color TEXT NOT NULL,
  group_id UUID REFERENCES student_groups(id) ON DELETE SET NULL
);

-- 커리큘럼
CREATE TABLE IF NOT EXISTS curriculum_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guitar_type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  level TEXT NOT NULL
);

-- 학생 진도
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  curriculum_item_id UUID NOT NULL REFERENCES curriculum_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  completed_date TEXT,
  notes TEXT,
  UNIQUE(student_id, curriculum_item_id)
);

-- 레슨 기록
CREATE TABLE IF NOT EXISTS lesson_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  topics TEXT NOT NULL,
  homework TEXT,
  notes TEXT
);

-- RLS(보안) 활성화
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_records ENABLE ROW LEVEL SECURITY;

-- 모든 테이블에 읽기/쓰기 허용 (단일 사용자용)
CREATE POLICY "Allow all on student_groups" ON student_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on curriculum_items" ON curriculum_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on student_progress" ON student_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on lesson_records" ON lesson_records FOR ALL USING (true) WITH CHECK (true);
