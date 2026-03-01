import { createClient } from "@supabase/supabase-js"

// 서버 사이드(API Routes)는 SUPABASE_URL / SUPABASE_KEY
// 클라이언트 사이드(브라우저)는 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL(또는 SUPABASE_URL)와 " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY(또는 SUPABASE_KEY) 환경 변수를 확인하세요."
  )
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

export type GyomuTask = Database["public"]["Tables"]["gyomu_tasks"]["Row"]

/**
 * gyomu_tasks 테이블 전체 데이터를 target_date 오름차순으로 가져옵니다.
 * target_date 가 null 인 항목은 맨 뒤로 정렬됩니다.
 */
export async function fetchTasks(): Promise<GyomuTask[]> {
  const { data, error } = await supabase
    .from("gyomu_tasks")
    .select("*")
    .order("target_date", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("[fetchTasks] Supabase 조회 오류:", error.message)
    throw new Error(error.message)
  }

  return data ?? []
}

/**
 * 특정 task_name 의 단건 데이터를 가져옵니다.
 */
export async function fetchTaskByName(taskName: string): Promise<GyomuTask | null> {
  const { data, error } = await supabase
    .from("gyomu_tasks")
    .select("*")
    .eq("task_name", taskName)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null  // 결과 없음
    console.error("[fetchTaskByName] Supabase 조회 오류:", error.message)
    throw new Error(error.message)
  }

  return data
}
