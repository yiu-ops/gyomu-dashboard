"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  AlertOctagon,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Circle,
  ClipboardList,
  Copy,
  FileCode2,
  Lightbulb,
  Loader2,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
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

// ── 기안문 초안 복사 블록 ────────────────────────────────────────
function DraftBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative rounded-md border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200 transition-colors"
        aria-label="초안 복사"
      >
        {copied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        {copied ? "복사됨" : "복사"}
      </button>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 pr-16 text-xs leading-relaxed text-slate-700 font-mono">
        {text}
      </pre>
    </div>
  )
}

// ── 준수 체크리스트 ──────────────────────────────────────────────
function ComplianceChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => Array(items.length).fill(false))
  const completedCount = checked.filter(Boolean).length
  return (
    <div className="flex flex-col gap-1.5">
      <p className="mb-1 text-[11px] text-muted-foreground">
        완료 {completedCount}/{items.length}
      </p>
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setChecked((prev) => { const next = [...prev]; next[i] = !next[i]; return next })}
          className={cn(
            "flex items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
            checked[i]
              ? "bg-emerald-50 text-emerald-800 line-through decoration-emerald-400"
              : "bg-muted/40 text-foreground hover:bg-muted"
          )}
        >
          {checked[i]
            ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <span className="leading-relaxed">{item}</span>
        </button>
      ))}
    </div>
  )
}

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

      {/* ── 🚨 긴급 주의보 (early_warning) ──────────────────────── */}
      {data.early_warning && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="mb-0.5 text-xs font-bold text-red-700">🚨 긴급 주의보</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-red-900">
              {data.early_warning}
            </p>
          </div>
        </div>
      )}

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

      {/* ── 처리 기준 시점 (standard_timeline) ───────────────────── */}
      {data.standard_timeline && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarClock className="h-4 w-4 text-sky-600" />
              처리 기준 시점
              <Badge variant="outline" className="ml-auto border-sky-200 bg-sky-50 text-sky-700 text-[11px]">
                행정편람 기준
              </Badge>
            </h4>
            <p className="whitespace-pre-line rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-sm leading-relaxed text-sky-900">
              {data.standard_timeline}
            </p>
          </section>
        </>
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

      {/* ── 준수 체크리스트 (compliance_checklists) ──────────────── */}
      {data.compliance_checklists && data.compliance_checklists.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardList className="h-4 w-4 text-violet-500" />
              준수 체크리스트
            </h4>
            <ComplianceChecklist items={data.compliance_checklists} />
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

      {/* ── 기안문 초안 뼈대 (auto_draft_context) ────────────────── */}
      {data.auto_draft_context && (
        <>
          <Separator />
          <section>
            <h4 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileCode2 className="h-4 w-4 text-slate-600" />
              기안문 초안 뼈대
            </h4>
            <DraftBlock text={data.auto_draft_context} />
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

