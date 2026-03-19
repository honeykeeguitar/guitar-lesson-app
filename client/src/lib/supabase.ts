import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xnawpxdjwfbkwcwlyaqa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYXdweGRqd2Zia3djd2x5YXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4OTQzMDgsImV4cCI6MjA4OTQ3MDMwOH0.jjErRrODuEhz0Bh9t267lSNSjedL8gd0jMUn4Mx4Bis";

// In-memory storage adapter to avoid localStorage (blocked in sandboxed iframes)
const memoryStorage: Record<string, string> = {};
const memoryStorageAdapter = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: memoryStorageAdapter,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
