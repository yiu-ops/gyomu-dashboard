"use client"

import useSWR from "swr"
import {
  BookOpen,
  CalendarClock,
  Zap,
  Lightbulb,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { RagInsight } from "@/lib/data"

interface RagInsightPanelProps {
  taskName: string
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })

export function RagInsightPanel({ taskName }: RagInsightPanelProps) {
  const encoded = encodeURIComponent(taskName)
  const { data, error, isLoading } = useSWR<RagInsight | null>(
    `/api/insights?task_name=${encoded}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  // ── 로딩 ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        RAG 인사이트 불러오는 중…
      </div>
    )
  }

  // ── 오류 ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        인사이트를 불러오지 못했습니다.
      </div>
    )
  }

  // ── 데이터 없음 ───────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        아직 분석된 RAG 인사이트가 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 대상 기한 */}
      {data.target_date && (
        <section>
          <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarClock className="h-4 w-4 text-primary" />
            대상 기한
          </h4>
          <p className="text-sm text-muted-foreground">{data.target_date}</p>
        </section>
      )}

      {/* 핵심 근거 규정 */}
      {data.core_regulations && data.core_regulations.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              핵심 근거 규정
            </h4>
            <ul className="flex flex-col gap-2">
              {data.core_regulations.map((reg, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">{reg}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* 사전 액션 트리거 */}
      {data.action_triggers && data.action_triggers.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              사전 액션 트리거
            </h4>
            <div className="flex flex-col gap-2">
              {data.action_triggers.map((trigger, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="mt-0.5 shrink-0 border-amber-300 bg-amber-50 text-amber-700 font-normal"
                  >
                    액션 {i + 1}
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">{trigger}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* 교훈 및 개선점 */}
      {data.lessons_learned && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              교훈 및 개선점
            </h4>
            <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
              {data.lessons_learned}
            </p>
          </section>
        </>
      )}

      {/* 출처 */}
      {data.source_file && (
        <p className="text-right text-[11px] text-muted-foreground/60">
          출처: {data.source_file}
        </p>
      )}
    </div>
  )
}
