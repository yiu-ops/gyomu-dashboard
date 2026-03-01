"use client"

/**
 * rag-insights-tab.tsx — 업무 지휘소 (Command Center)
 *
 * 레이아웃 구조:
 * ┌─────────────────────────────────────────────────────┐
 * │  [1] 요약 위젯 (이번주 마감 / 긴급 / 사전작업 / 전체) │
 * ├─────────────────────────────────────────────────────┤
 * │  [2] 시급성 섹션 (긴급 → 진행 중 → 대기 → 지남)    │
 * │      각 카드:                                        │
 * │        • D-Day 뱃지  +  날짜                         │
 * │        • 업무명  +  🚨(lessons_learned 호버 툴팁)   │
 * │        • 핵심 규정 짧은 뱃지 (최대 3개 + 더보기)    │
 * │        • 사전 작업 체크박스 To-do (아코디언)        │
 * └─────────────────────────────────────────────────────┘
 */

import { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClockAlert,
  InboxIcon,
  ListChecks,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, calculateDDay } from "@/lib/utils"
import { fetchTasks, type GyomuTask } from "@/lib/supabase"

// ══════════════════════════════════════════════════════════════════
// 내부 유틸: 규정명 축약
// ══════════════════════════════════════════════════════════════════
function shortenReg(text: string, max = 28): string {
  return text.length > max ? text.slice(0, max) + "…" : text
}

// ══════════════════════════════════════════════════════════════════
// 내부 유틸: 트리거 항목 텍스트 추출
// ══════════════════════════════════════════════════════════════════
function triggerText(t: unknown): string {
  if (typeof t === "string") return t
  if (t && typeof t === "object") {
    const obj = t as Record<string, unknown>
    if (obj.action) return `${obj.trigger ?? ""} → ${obj.action}`.trim()
    return JSON.stringify(t)
  }
  return String(t)
}

// ══════════════════════════════════════════════════════════════════
// [1] 요약 위젯
// ══════════════════════════════════════════════════════════════════
interface SummaryWidgetsProps {
  tasks: GyomuTask[]
}

function SummaryWidgets({ tasks }: SummaryWidgetsProps) {
  const weekCount = tasks.filter((t) => {
    const { diff } = calculateDDay(t.target_date)
    return diff !== null && diff >= 0 && diff <= 7
  }).length

  const urgentCount = tasks.filter((t) => {
    const { section } = calculateDDay(t.target_date)
    return section === "urgent"
  }).length

  const totalTriggers = tasks.reduce((acc, t) => {
    return acc + (Array.isArray(t.action_triggers) ? t.action_triggers.length : 0)
  }, 0)

  const widgets = [
    {
      label: "이번 주 마감",
      value: weekCount,
      icon: <ClockAlert className="h-5 w-5" />,
      accent: "text-red-600 bg-red-50 border-red-100",
      valueColor: "text-red-700",
    },
    {
      label: "긴급 업무 (D-7)",
      value: urgentCount,
      icon: <Zap className="h-5 w-5" />,
      accent: "text-orange-600 bg-orange-50 border-orange-100",
      valueColor: "text-orange-700",
    },
    {
      label: "사전 작업 항목",
      value: totalTriggers,
      icon: <ListChecks className="h-5 w-5" />,
      accent: "text-blue-600 bg-blue-50 border-blue-100",
      valueColor: "text-blue-700",
    },
    {
      label: "전체 분석 업무",
      value: tasks.length,
      icon: <ClipboardCheck className="h-5 w-5" />,
      accent: "text-gray-600 bg-gray-50 border-gray-100",
      valueColor: "text-gray-700",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {widgets.map((w) => (
        <div
          key={w.label}
          className={cn(
            "flex flex-col gap-2 rounded-xl border p-4 shadow-xs",
            w.accent
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-current opacity-70">{w.label}</span>
            <span className={cn("opacity-60", w.valueColor)}>{w.icon}</span>
          </div>
          <span className={cn("text-3xl font-bold tracking-tight", w.valueColor)}>
            {w.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// [3] Lessons 호버 툴팁 (🚨 아이콘 클릭/hover 팝업)
// ══════════════════════════════════════════════════════════════════
function LessonsTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative inline-flex shrink-0">
      <button
        type="button"
        className="ml-1 inline-flex items-center rounded p-0.5 text-amber-500 hover:bg-amber-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="지난 학기 주의사항"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-50 w-64 rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-lg">
          <p className="mb-1 text-xs font-semibold text-amber-800">🚨 지난 학기 주의사항</p>
          <p className="text-xs leading-relaxed text-amber-900 whitespace-pre-line">{text}</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// [2+3+4] 개별 인사이트 카드
// ══════════════════════════════════════════════════════════════════
function InsightCard({ task }: { task: GyomuTask }) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState<boolean[]>([])

  const dday = calculateDDay(task.target_date)
  const triggers: unknown[] = Array.isArray(task.action_triggers) ? task.action_triggers : []
  const regulations: string[] = Array.isArray(task.core_regulations) ? task.core_regulations : []
  const hasLessons = !!task.lessons_learned?.trim()

  useEffect(() => {
    setChecked(Array(triggers.length).fill(false))
  }, [triggers.length])

  const completedCount = checked.filter(Boolean).length

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
        dday.section === "urgent" && "border-orange-200",
        dday.section === "overdue" && "opacity-70"
      )}
    >
      {/* ── 헤더 ─────────────────────────────────────────── */}
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
              dday.colorClass
            )}
          >
            {dday.section === "urgent" && <ClockAlert className="h-3 w-3" />}
            {dday.label}
          </span>
          {task.target_date && (
            <span className="text-xs text-muted-foreground">{task.target_date}</span>
          )}
        </div>

        <div className="mt-1.5 flex items-start gap-1">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {task.task_name}
          </p>
          {hasLessons && <LessonsTooltip text={task.lessons_learned!} />}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-4 pb-4">
        {/* ── 핵심 규정 짧은 뱃지 ─────────────────────── */}
        {regulations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="mr-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3 w-3" />
            </span>
            {regulations.slice(0, 3).map((reg, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="max-w-[160px] truncate rounded-full px-2 py-0 text-[11px] font-normal leading-5"
                title={reg}
              >
                {shortenReg(reg)}
              </Badge>
            ))}
            {regulations.length > 3 && (
              <Badge variant="outline" className="rounded-full px-2 py-0 text-[11px] leading-5">
                +{regulations.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* ── 사전 작업 체크박스 To-do ─────────────────── */}
        {triggers.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-1 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
              aria-expanded={expanded}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                사전 작업
                <span className="rounded-full bg-muted px-1.5 py-0 text-[10px]">
                  {completedCount}/{triggers.length}
                </span>
              </span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {expanded && (
              <ol className="mt-2 flex flex-col gap-2 pl-1">
                {triggers.map((trigger, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Checkbox
                      id={`${task.id}-trigger-${i}`}
                      checked={checked[i] ?? false}
                      onCheckedChange={(val) =>
                        setChecked((prev) => {
                          const next = [...prev]
                          next[i] = val === true
                          return next
                        })
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <label
                      htmlFor={`${task.id}-trigger-${i}`}
                      className={cn(
                        "cursor-pointer text-xs leading-relaxed text-foreground",
                        checked[i] && "text-muted-foreground line-through"
                      )}
                    >
                      {triggerText(trigger)}
                    </label>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════════
// 스켈레톤 / 빈 상태
// ══════════════════════════════════════════════════════════════════
function SkeletonWidgets() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="mb-3 h-4 w-3/4" />
          <div className="flex gap-1.5">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-muted p-4">
        <InboxIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold">분석 데이터가 없습니다</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Work-automation 파이프라인을 실행하면 인사이트가 표시됩니다.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// [2] 시급성 섹션
// ══════════════════════════════════════════════════════════════════
const SECTIONS = [
  {
    key: "urgent",
    label: "🔴 긴급",
    desc: "D-7 이내",
    headerClass: "border-l-4 border-red-400 bg-red-50/60 pl-3",
  },
  {
    key: "ongoing",
    label: "🟡 진행 중",
    desc: "D-8 ~ D-30",
    headerClass: "border-l-4 border-yellow-400 bg-yellow-50/60 pl-3",
  },
  {
    key: "waiting",
    label: "🔵 대기",
    desc: "D-31 이후",
    headerClass: "border-l-4 border-blue-300 bg-blue-50/60 pl-3",
  },
  {
    key: "overdue",
    label: "⬛ 마감 지남",
    desc: "목표일 경과",
    headerClass: "border-l-4 border-gray-300 bg-gray-50/60 pl-3",
  },
  {
    key: "none",
    label: "⬜ 날짜 없음",
    desc: "목표일 미설정",
    headerClass: "border-l-4 border-gray-200 bg-gray-50/40 pl-3",
  },
] as const

function UrgencySections({ tasks }: { tasks: GyomuTask[] }) {
  const grouped = Object.fromEntries(
    SECTIONS.map((s) => [s.key, [] as GyomuTask[]])
  ) as Record<string, GyomuTask[]>

  for (const task of tasks) {
    const { section } = calculateDDay(task.target_date)
    grouped[section].push(task)
  }

  return (
    <div className="flex flex-col gap-8">
      {SECTIONS.map(({ key, label, desc, headerClass }) => {
        const items = grouped[key]
        if (items.length === 0) return null

        return (
          <section key={key}>
            <div className={cn("mb-4 flex items-center justify-between rounded-r-md py-2 pr-3", headerClass)}>
              <div>
                <span className="text-sm font-bold text-foreground">{label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{desc}</span>
              </div>
              <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-foreground shadow-xs">
                {items.length}건
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((task) => (
                <InsightCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 탭 루트 컴포넌트
// ══════════════════════════════════════════════════════════════════
export function RagInsightsTab() {
  const [tasks, setTasks] = useState<GyomuTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonWidgets />
        <SkeletonCards />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          데이터를 불러오지 못했습니다: {error}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-8">
      <SummaryWidgets tasks={tasks} />
      <UrgencySections tasks={tasks} />
    </div>
  )
}
