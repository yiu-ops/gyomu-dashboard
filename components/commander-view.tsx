"use client"

/**
 * commander-view.tsx — 지휘관 뷰 (업무 지휘 센터)
 *
 * 구성:
 *   [1] 업무 누락 감지 레이더 (Anomaly Detection)
 *       - standard_timeline 텍스트에서 월 키워드를 파싱
 *       - 현재 월과 비교해 "지금 시작했어야 하는데 미착수" 업무를 경고
 *   [2] 칸반 보드 (Kanban Planner)
 *       - 컬럼: [이번 주 임박 D-7이내] [다음 주 예정 D-8~14] [이번 달 준비 D-15~30] [장기 / 미정]
 *       - 카드: standard_timeline 뱃지 + compliance_checklists 진행률 바
 *       - 카드 클릭 → 상세 다이얼로그
 */

import { useEffect, useState } from "react"
import {
  AlertOctagon,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  FileCode2,
  Inbox,
  Lightbulb,
  Loader2,
  ShieldAlert,
  TriangleAlert,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, calculateDDay } from "@/lib/utils"
import { fetchTasks, type GyomuTask } from "@/lib/supabase"

// ═══════════════════════════════════════════════════════════════════
// 유틸: standard_timeline 텍스트에서 언급된 월(1~12) 추출
// ═══════════════════════════════════════════════════════════════════
function extractMentionedMonths(text: string): number[] {
  const months: number[] = []
  for (const m of text.matchAll(/(\d{1,2})월/g)) {
    const n = parseInt(m[1])
    if (n >= 1 && n <= 12) months.push(n)
  }
  if (/1학기\s*시작|학기\s*초|봄학기/.test(text)) months.push(3)
  if (/2학기\s*시작|가을학기/.test(text)) months.push(9)
  if (/1학기\s*말/.test(text)) months.push(6)
  if (/2학기\s*말/.test(text)) months.push(12)
  if (/학기 시작 직전/.test(text)) months.push(2, 8)
  return months
}

// ═══════════════════════════════════════════════════════════════════
// 유틸: 칸반 열 분류
// ═══════════════════════════════════════════════════════════════════
type KanbanColumn = "this-week" | "next-week" | "this-month" | "later"

function getKanbanColumn(task: GyomuTask): KanbanColumn {
  const { diff } = calculateDDay(task.target_date)
  if (diff === null) return "later"
  if (diff < 0) return "this-week"          // 마감 지난 건도 최우선 표시
  if (diff <= 7) return "this-week"
  if (diff <= 14) return "next-week"
  if (diff <= 30) return "this-month"
  return "later"
}

// ═══════════════════════════════════════════════════════════════════
// [1] 업무 누락 감지 레이더
// ═══════════════════════════════════════════════════════════════════
function AnomalyRadar({ tasks }: { tasks: GyomuTask[] }) {
  const [expanded, setExpanded] = useState(true)
  const currentMonth = new Date().getMonth() + 1 // 1~12

  const anomalies = tasks.filter((t) => {
    if (!t.standard_timeline?.trim()) return false
    const months = extractMentionedMonths(t.standard_timeline)
    if (months.length === 0) return false
    // 언급된 최소 월이 현재 월 이하 → "지금 시작했어야 함"
    const shouldHaveStartedBy = Math.min(...months)
    if (shouldHaveStartedBy > currentMonth) return false
    // target_date 가 미래거나 없으면 → 아직 완료 전으로 판단
    const { diff } = calculateDDay(t.target_date)
    return diff === null || diff > 0
  })

  if (anomalies.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="font-medium">업무 누락 없음</span>
        <span className="text-emerald-700/80">— 현재 시기({currentMonth}월)에 누락된 업무가 감지되지 않았습니다.</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-red-100/60 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
          <span className="text-sm font-bold text-red-800">
            ⚠️ 업무 누락 감지 레이더
          </span>
          <span className="rounded-full bg-red-600 px-2 py-0 text-[11px] font-bold text-white">
            {anomalies.length}건
          </span>
          <span className="text-xs text-red-600/80">
            {currentMonth}월 기준, 지금 시작했어야 하는 업무
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-red-600" />
          : <ChevronDown className="h-4 w-4 text-red-600" />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-red-200 px-4 pb-4 pt-3">
          {anomalies.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-white px-3 py-2.5 shadow-xs"
            >
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-900">{t.task_name}</p>
                {t.standard_timeline && (
                  <p className="mt-0.5 text-xs text-red-700/80 line-clamp-1">
                    예정 시점: {t.standard_timeline}
                  </p>
                )}
                {t.early_warning && (
                  <p className="mt-0.5 text-xs text-red-600 line-clamp-1">
                    🚨 {t.early_warning}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-red-300 bg-red-50 text-red-700 text-[11px]"
              >
                {t.target_date ?? "날짜 미정"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// [2] 칸반 카드
// ═══════════════════════════════════════════════════════════════════
interface KanbanCardProps {
  task: GyomuTask
  onClick: () => void
}

function KanbanCard({ task, onClick }: KanbanCardProps) {
  const dday = calculateDDay(task.target_date)
  const checklists = Array.isArray(task.compliance_checklists)
    ? task.compliance_checklists
    : []
  const total = checklists.length
  // 완료 진행률은 UI 상태이므로 0으로 초기화 (카드에서는 "0/N" 표시)
  const progressPct = 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border bg-card p-3 text-left shadow-xs",
        "hover:shadow-md hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        dday.section === "urgent" && "border-orange-200 bg-orange-50/30",
        dday.section === "overdue" && "border-red-300 bg-red-50/40"
      )}
    >
      {/* 상단: D-Day 뱃지 + standard_timeline */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-4",
            dday.colorClass
          )}
        >
          {dday.section === "urgent" && <Zap className="h-2.5 w-2.5" />}
          {dday.label}
        </span>
        {task.standard_timeline && (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700 max-w-[140px] truncate">
            <CalendarClock className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{task.standard_timeline}</span>
          </span>
        )}
      </div>

      {/* 업무명 */}
      <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
        {task.task_name}
      </p>

      {/* early_warning 미니 배너 */}
      {task.early_warning && (
        <p className="line-clamp-1 flex items-center gap-1 text-[11px] text-red-700">
          <AlertOctagon className="h-3 w-3 shrink-0" />
          {task.early_warning}
        </p>
      )}

      {/* 하단: compliance_checklists 진행률 바 */}
      {total > 0 ? (
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CircleDashed className="h-3 w-3" />
              준수 체크 진행
            </span>
            <span>0 / {total} 완료</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      ) : (
        task.target_date && (
          <p className="mt-auto text-[10px] text-muted-foreground">{task.target_date}</p>
        )
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// [3] 상세 다이얼로그
// ═══════════════════════════════════════════════════════════════════
interface TaskDetailDialogProps {
  task: GyomuTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200 transition-colors"
    >
      {copied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : null}
      {copied ? "복사됨" : "복사"}
    </button>
  )
}

function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const [checklistChecked, setChecklistChecked] = useState<boolean[]>([])

  useEffect(() => {
    if (!task) return
    const items = Array.isArray(task.compliance_checklists)
      ? task.compliance_checklists
      : []
    setChecklistChecked(Array(items.length).fill(false))
  }, [task])

  if (!task) return null

  const checklists: string[] = Array.isArray(task.compliance_checklists)
    ? task.compliance_checklists
    : []
  const regulations: string[] = Array.isArray(task.core_regulations)
    ? task.core_regulations
    : []
  const triggers: string[] = Array.isArray(task.action_triggers)
    ? task.action_triggers as string[]
    : []
  const dday = calculateDDay(task.target_date)
  const done = checklistChecked.filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", dday.colorClass)}>
              {dday.label}
            </span>
            {task.semester && (
              <Badge variant="secondary" className="text-[11px]">{task.semester}</Badge>
            )}
          </div>
          <DialogTitle className="text-base leading-snug pr-8">
            {task.task_name}
          </DialogTitle>
          <DialogDescription className="sr-only">{task.task_name} 상세</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="flex flex-col gap-5 px-6 py-5">

            {/* 🚨 긴급 주의보 */}
            {task.early_warning && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-bold text-red-700 mb-0.5">🚨 긴급 주의보</p>
                  <p className="text-sm leading-relaxed text-red-900 whitespace-pre-line">
                    {task.early_warning}
                  </p>
                </div>
              </div>
            )}

            {/* 처리 기준 시점 */}
            {task.standard_timeline && (
              <>
                <section>
                  <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <CalendarClock className="h-4 w-4 text-sky-600" />
                    처리 기준 시점
                    <span className="ml-auto text-[11px] border border-sky-200 bg-sky-50 text-sky-700 rounded-full px-2 py-0.5">행정편람 기준</span>
                  </h4>
                  <p className="whitespace-pre-line rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-sky-900 leading-relaxed">
                    {task.standard_timeline}
                  </p>
                </section>
                <Separator />
              </>
            )}

            {/* 핵심 규정 */}
            {regulations.length > 0 && (
              <>
                <section>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    핵심 근거 규정
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {regulations.map((reg, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                        <span className="shrink-0 font-mono text-xs font-bold text-primary mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="leading-relaxed">{reg}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <Separator />
              </>
            )}

            {/* 준수 체크리스트 */}
            {checklists.length > 0 && (
              <>
                <section>
                  <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-violet-500" />
                    준수 체크리스트
                    <span className="ml-auto text-xs text-muted-foreground">{done}/{checklists.length} 완료</span>
                  </h4>
                  <Progress value={Math.round((done / checklists.length) * 100)} className="h-1.5 mb-3" />
                  <div className="flex flex-col gap-1.5">
                    {checklists.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChecklistChecked((prev) => {
                          const next = [...prev]
                          next[i] = !next[i]
                          return next
                        })}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          checklistChecked[i]
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-muted/40 text-foreground hover:bg-muted"
                        )}
                      >
                        {checklistChecked[i]
                          ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          : <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <span className={cn("leading-relaxed", checklistChecked[i] && "line-through decoration-emerald-400")}>
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* 사전 액션 트리거 */}
            {triggers.length > 0 && (
              <>
                <section>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Zap className="h-4 w-4 text-amber-500" />
                    사전 액션 트리거
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {triggers.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant="outline" className="mt-0.5 shrink-0 border-amber-300 bg-amber-50 text-amber-700 font-normal">
                          {i + 1}
                        </Badge>
                        <span className="text-muted-foreground leading-relaxed">{t}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* 교훈 */}
            {task.lessons_learned && (
              <>
                <section>
                  <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    교훈 및 개선점
                  </h4>
                  <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                    {task.lessons_learned}
                  </p>
                </section>
                <Separator />
              </>
            )}

            {/* 기안문 초안 */}
            {task.auto_draft_context && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <FileCode2 className="h-4 w-4 text-slate-600" />
                  기안문 초안 뼈대
                </h4>
                <div className="relative rounded-md border border-slate-200 bg-slate-50">
                  <div className="absolute right-2 top-2">
                    <CopyButton text={task.auto_draft_context} />
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 pr-16 text-xs leading-relaxed text-slate-700 font-mono">
                    {task.auto_draft_context}
                  </pre>
                </div>
              </section>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════
// [4] 칸반 열 컴포넌트
// ═══════════════════════════════════════════════════════════════════
const KANBAN_COLUMNS = [
  {
    key: "this-week" as const,
    label: "이번 주 임박",
    sub: "D-7 이내",
    headerClass: "bg-red-50 border-red-200",
    labelClass: "text-red-700",
    countClass: "bg-red-600 text-white",
    emptyIcon: <CheckCircle2 className="h-5 w-5 text-red-200" />,
  },
  {
    key: "next-week" as const,
    label: "다음 주 예정",
    sub: "D-8 ~ D-14",
    headerClass: "bg-orange-50 border-orange-200",
    labelClass: "text-orange-700",
    countClass: "bg-orange-500 text-white",
    emptyIcon: <CheckCircle2 className="h-5 w-5 text-orange-200" />,
  },
  {
    key: "this-month" as const,
    label: "이번 달 준비",
    sub: "D-15 ~ D-30",
    headerClass: "bg-yellow-50 border-yellow-200",
    labelClass: "text-yellow-700",
    countClass: "bg-yellow-500 text-white",
    emptyIcon: <CheckCircle2 className="h-5 w-5 text-yellow-200" />,
  },
  {
    key: "later" as const,
    label: "장기 / 미정",
    sub: "D-31 이후 또는 날짜 없음",
    headerClass: "bg-slate-50 border-slate-200",
    labelClass: "text-slate-600",
    countClass: "bg-slate-400 text-white",
    emptyIcon: <Inbox className="h-5 w-5 text-slate-200" />,
  },
] as const

interface KanbanBoardProps {
  tasks: GyomuTask[]
  onCardClick: (task: GyomuTask) => void
}

function KanbanBoard({ tasks, onCardClick }: KanbanBoardProps) {
  const grouped = Object.fromEntries(
    KANBAN_COLUMNS.map((c) => [c.key, [] as GyomuTask[]])
  ) as Record<KanbanColumn, GyomuTask[]>

  for (const task of tasks) {
    grouped[getKanbanColumn(task)].push(task)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KANBAN_COLUMNS.map((col) => {
        const items = grouped[col.key]
        return (
          <div key={col.key} className="flex flex-col gap-3">
            {/* 열 헤더 */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                col.headerClass
              )}
            >
              <div>
                <p className={cn("text-sm font-bold", col.labelClass)}>{col.label}</p>
                <p className="text-[10px] text-muted-foreground">{col.sub}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                  col.countClass
                )}
              >
                {items.length}
              </span>
            </div>

            {/* 카드 목록 */}
            <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-2 min-h-[120px]">
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
                  {col.emptyIcon}
                  <p className="text-[11px] text-muted-foreground">없음</p>
                </div>
              ) : (
                items.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onCardClick(task)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 스켈레톤
// ═══════════════════════════════════════════════════════════════════
function CommanderSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-14 rounded-lg" />
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-28 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 루트 컴포넌트
// ═══════════════════════════════════════════════════════════════════
export function CommanderView() {
  const [tasks, setTasks] = useState<GyomuTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<GyomuTask | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <CommanderSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-destructive gap-2">
        <AlertOctagon className="h-4 w-4" />
        데이터를 불러오지 못했습니다: {error}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-semibold">분석 데이터가 없습니다</p>
        <p className="text-xs text-muted-foreground">Work-automation 파이프라인을 실행하면 인사이트가 표시됩니다.</p>
      </div>
    )
  }

  const handleCardClick = (task: GyomuTask) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── [1] 업무 누락 감지 레이더 ── */}
      <AnomalyRadar tasks={tasks} />

      {/* ── 섹션 헤더 ── */}
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-bold text-foreground">업무 타임라인 칸반</h2>
        <span className="ml-auto text-xs text-muted-foreground">카드를 클릭하면 상세 정보를 볼 수 있습니다</span>
      </div>

      {/* ── [2] 칸반 보드 ── */}
      <KanbanBoard tasks={tasks} onCardClick={handleCardClick} />

      {/* ── [3] 상세 다이얼로그 ── */}
      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
