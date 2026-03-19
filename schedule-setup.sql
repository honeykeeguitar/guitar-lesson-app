-- 레슨 일정 테이블
CREATE TABLE IF NOT EXISTS lesson_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 및 정책
ALTER TABLE lesson_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON lesson_schedules FOR ALL TO anon USING (true) WITH CHECK (true);
