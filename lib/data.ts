export type Category =
  | "교원인사"
  | "비전임조교관리"
  | "겸직관리"
  | "교원연수출장"
  | "교원업적평가"
  | "위원회운영"
  | "교원상벌"
  | "교원연구활동지원"
  | "기타업무"

export const ALL_CATEGORIES: Category[] = [
  "교원인사",
  "비전임조교관리",
  "겸직관리",
  "교원연수출장",
  "교원업적평가",
  "위원회운영",
  "교원상벌",
  "교원연구활동지원",
  "기타업무",
]

export interface TimelineEntry {
  date: string
  action: string
}

export interface TaskMeta {
  source_zip: string
  folder_in_zip: string
  filename: string
  extension: string
}

export interface Task {
  category: Category
  task_name: string
  description: string
  precautions: string[]
  timeline: TimelineEntry[]
  related_depts: string[]
  deliverables: string[]
  _parse_status: "ok" | "skipped_empty" | "error_json" | "error_api"
  _meta: TaskMeta
}

// ── RAG 인사이트 (rag_analyzer.py 출력 스키마) ────────────────────────────────
export interface RagInsight {
  id?: string
  task_name: string
  target_date: string
  core_regulations: string[]
  action_triggers: string[]
  lessons_learned: string
  source_file?: string
  created_at?: string
  updated_at?: string
  // v2 필드
  reference_documents?: string[]
  compliance_check?: string
  recurrence_pattern?: string
  document_count?: number
  semester?: string
  // v3 SOP 생성기 필드
  standard_timeline?: string
  compliance_checklists?: (string | { text: string; done: boolean })[] | null
  early_warning?: string
  auto_draft_context?: string
}

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; ring: string }> = {
  교원인사: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
  비전임조교관리: { bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-200" },
  겸직관리: { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" },
  교원연수출장: { bg: "bg-cyan-100", text: "text-cyan-700", ring: "ring-cyan-200" },
  교원업적평가: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" },
  위원회운영: { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-200" },
  교원상벌: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-200" },
  교원연구활동지원: { bg: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-200" },
  기타업무: { bg: "bg-gray-100", text: "text-gray-700", ring: "ring-gray-200" },
}
