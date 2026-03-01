"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClockAlert,
  InboxIcon,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, calculateDDay } from "@/lib/utils"
import { fetchTasks, type GyomuTask } from "@/lib/supabase"

// ══════════════════════════════════════════════════════════════════
// 스켈레톤 로딩 UI
// ══════════════════════════════════════════════════════════════════
function InsightCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════════
// 빈 상태 UI
// ══════════════════════════════════════════════════════════════════
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-muted p-4">
        <InboxIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">분석 데이터가 없습니다</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Work-automation 파이프라인을 실행하면 인사이트가 표시됩니다.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 개별 인사이트 카드
// ══════════════════════════════════════════════════════════════════
function InsightCard({ task }: { task: GyomuTask }) {
  const [expanded, setExpanded] = useState(false)
  const dday = calculateDDay(task.target_date)

  const triggers = Array.isArray(task.action_triggers) ? task.action_triggers : []
  const regulations = Array.isArray(task.core_regulations) ? task.core_regulations : []
  const hasLessons = !!task.lessons_learned?.trim()
  const hasUrgency = dday.diff !== null && dday.diff <= 7 && dday.diff >= 0

  return (
    <Card
      className={cn(
        "flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md",
        hasUrgency && "border-orange-200"
      )}
    >
      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* D-Day 뱃지 */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
              dday.colorClass
            )}
          >
            {dday.diff !== null && dday.diff <= 3 && dday.diff >= 0 && (
              <ClockAlert className="h-3 w-3" />
            )}
            {dday.label}
          </span>
          {/* 목표일 텍스트 */}
          {task.target_date && (
            <span className="text-xs text-muted-foreground">{task.target_date}</span>
          )}
        </div>
        <CardTitle className="mt-1 text-sm font-semibold leading-snug text-foreground">
          {task.task_name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* ── 핵심 규정 뱃지 ───────────────────────────────────── */}
        {regulations.length > 0 && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <BookOpen className="h-3.5 w-3.5" />
              핵심 근거 규정
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {regulations.map((reg, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="rounded-full text-xs font-normal"
                >
                  {reg}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* ── 사전 작업 아코디언 ──────────────────────────────── */}
        {triggers.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-1 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-muted/60 transition-colors"
              aria-expanded={expanded}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                사전 작업 트리거 ({triggers.length}건)
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expanded && (
              <ol className="mt-2 flex flex-col gap-2 pl-1">
                {triggers.map((trigger, i) => {
                  const text = typeof trigger === "string" ? trigger : JSON.stringify(trigger)
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">{text}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        )}

        {/* ── 회고 및 주의사항 callout ─────────────────────────── */}
        {hasLessons && (
          <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold text-yellow-800">지난 학기 주의사항</p>
              <p className="text-xs leading-relaxed text-yellow-900 whitespace-pre-line">
                {task.lessons_learned}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ══════════════════════════════════════════════════════════════════
// 탭 메인 컴포넌트
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

  // ── 로딩 ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ── 오류 ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          데이터를 불러오지 못했습니다: {error}
        </div>
      </div>
    )
  }

  // ── 빈 상태 ───────────────────────────────────────────────────
  if (tasks.length === 0) {
    return <EmptyState />
  }

  // ── 상단 요약 배지 ─────────────────────────────────────────────
  const urgentCount = tasks.filter((t) => {
    const { diff } = calculateDDay(t.target_date)
    return diff !== null && diff >= 0 && diff <= 7
  }).length

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 헤더 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm shadow-xs">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <span className="font-medium">전체 {tasks.length}건</span>
        </div>
        {urgentCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm shadow-xs">
            <ClockAlert className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-700">D-7 이내 긴급 {urgentCount}건</span>
          </div>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <InsightCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
