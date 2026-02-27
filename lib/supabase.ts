import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  // 빌드 타임 오류 방지용 — 런타임에 실제로 호출 시 에러 발생
  console.warn("[Supabase] SUPABASE_URL 또는 SUPABASE_KEY 환경 변수가 설정되지 않았습니다.")
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder"
)

export type Database = {
  public: {
    Tables: {
      gyomu_tasks: {
        Row: {
          id: string
          task_name: string
          target_date: string | null
          core_regulations: string[] | null
          action_triggers: string[] | null
          lessons_learned: string | null
          source_file: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["gyomu_tasks"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["gyomu_tasks"]["Insert"]>
      }
    }
  }
}
