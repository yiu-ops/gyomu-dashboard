"use client"

/**
 * action-modal.tsx — 업무 수행 지휘 팝업 (Action Gateway)
 *
 * 흐름:
 *   [열림] → 🚨 긴급 주의보 (early_warning) 최상단 표시
 *          → ✅ 규정 준수 체크리스트 (compliance_checklists) — 클릭 시 Supabase PATCH
 *          → 전체 체크 완료 시 → [✨ 기안문 초안 보기] 버튼 활성화
 *          → 초안 패널: auto_draft_context 렌더링 + 복사 버튼
 *
 * 핵심 로직:
 *   - 모든 체크리스트 100% 완료 전까지 초안 버튼 disabled
 *   - 체크 상태는 Supabase gyomu_tasks.compliance_checklists(JSONB)에 실시간 PATCH
 */

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertOctagon,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCopy,
  FileCode2,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Unlock,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn, calculateDDay } from "@/lib/utils"
import {
  normalizeChecklist,
  patchChecklistProgress,
  type ChecklistItem,
  type GyomuTask,
} from "@/lib/supabase"

interface ActionModalProps {
  task: GyomuTask | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ═══════════════════════════════════════════════════════════
// 복사 버튼
// ═══════════════════════════════════════════════════════════
function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handle}
      className={cn(
        "h-8 gap-1.5 text-xs",
        copied && "border-green-300 bg-green-50 text-green-700",
        className
      )}
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <ClipboardCopy className="h-3.5 w-3.5" />
      )}
      {copied ? "복사됨!" : "복사하기"}
    </Button>
  )
}

// ═══════════════════════════════════════════════════════════
// 섹션 헤더 (접기/펼치기)
// ═══════════════════════════════════════════════════════════
function CollapseSection({
  icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode
  title: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        aria-expanded={open}
      >
        {icon}
        {title}
        {badge}
        <span className="ml-auto">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </span>
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════════════════════
export function ActionModal({ task, open, onOpenChange }: ActionModalProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [saving, setSaving] = useState(false)
  const [draftVisible, setDraftVisible] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 태스크가 바뀌면 체크리스트·초안 뷰 초기화
  useEffect(() => {
    if (!task) return
    setItems(normalizeChecklist(task.compliance_checklists))
    setDraftVisible(false)
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 체크박스 토글 → 로컬 상태 업데이트 → 300ms 디바운스 후 Supabase PATCH
  const handleToggle = useCallback(
    (index: number) => {
      if (!task) return
      setItems((prev) => {
        const next = prev.map((it, i) =>
          i === index ? { ...it, done: !it.done } : it
        )
        // 디바운스 PATCH
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
          setSaving(true)
          await patchChecklistProgress(task.id, next)
          setSaving(false)
        }, 300)
        return next
      })
    },
    [task]
  )

  if (!task) return null

  const dday = calculateDDay(task.target_date)
  const regulations: string[] = Array.isArray(task.core_regulations)
    ? (task.core_regulations as string[])
    : []
  const triggers: string[] = Array.isArray(task.action_triggers)
    ? (task.action_triggers as string[])
    : []

  const totalItems = items.length
  const doneCount = items.filter((it) => it.done).length
  const allDone = totalItems > 0 && doneCount === totalItems
  const progressPct = totalItems === 0 ? 0 : Math.round((doneCount / totalItems) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">

        {/* ── 헤더 ────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-card">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
              dday.colorClass
            )}>
              {dday.label}
            </span>
            {task.semester && (
              <Badge variant="secondary" className="text-[11px]">{task.semester}</Badge>
            )}
            {saving && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                저장 중…
              </span>
            )}
            {!saving && doneCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                저장됨
              </span>
            )}
          </div>
          <DialogTitle className="text-base leading-snug pr-8">
            {task.task_name}
          </DialogTitle>
          <DialogDescription className="sr-only">{task.task_name} 업무 수행 지휘 팝업</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[78vh]">
          <div className="flex flex-col px-6 pb-8 pt-5 gap-5">

            {/* ══════════════════════════════════════════════
                🚨 ZONE 1 — 긴급 주의보 (early_warning)
                항상 최상단, 시각적으로 가장 강하게
            ═══════════════════════════════════════════════ */}
            {task.early_warning && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-4 shadow-sm"
              >
                <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="mb-1 text-sm font-extrabold tracking-wide text-red-700 uppercase">
                    🚨 긴급 주의보 — 반드시 확인하세요
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-red-900">
                    {task.early_warning}
                  </p>
                </div>
              </div>
            )}

            {/* 처리 기준 시점 */}
            {task.standard_timeline && (
              <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <div>
                  <p className="text-[11px] font-semibold text-sky-700 mb-0.5">처리 기준 시점 (행정편람)</p>
                  <p className="text-sm text-sky-900 leading-relaxed whitespace-pre-line">
                    {task.standard_timeline}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* ══════════════════════════════════════════════
                ✅ ZONE 2 — 규정 준수 체크리스트 (게이트)
            ═══════════════════════════════════════════════ */}
            <div>
              {/* 제목 + 진행률 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {allDone
                    ? <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    : <Lock className="h-4 w-4 text-violet-500" />}
                  <span className="text-sm font-bold text-foreground">
                    {allDone ? "✅ 규정 준수 완료" : "✅ 규정 준수 필수 체크리스트"}
                  </span>
                  <span className={cn(
                    "rounded-full px-2 py-0 text-[11px] font-bold",
                    allDone
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-violet-100 text-violet-700"
                  )}>
                    {doneCount}/{totalItems}
                  </span>
                </div>
                {totalItems > 0 && (
                  <span className="text-xs text-muted-foreground">{progressPct}%</span>
                )}
              </div>

              {totalItems > 0 && (
                <Progress
                  value={progressPct}
                  className={cn(
                    "mb-4 h-2 transition-all",
                    allDone ? "[&>div]:bg-emerald-500" : "[&>div]:bg-violet-500"
                  )}
                />
              )}

              {/* 체크리스트 항목 */}
              {totalItems === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  준수 체크리스트가 없습니다.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleToggle(i)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                        "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                        item.done
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-violet-100 bg-white text-foreground hover:border-violet-200 hover:bg-violet-50/40"
                      )}
                    >
                      {item.done ? (
                        <CheckSquare2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                      )}
                      <span className={cn(
                        "leading-relaxed",
                        item.done && "line-through decoration-emerald-400 text-emerald-700"
                      )}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* 잠금 안내 */}
              {!allDone && totalItems > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-violet-200 bg-violet-50/50 px-3 py-2">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                  <p className="text-xs text-violet-600">
                    위 체크리스트를 <strong>모두 완료</strong>하면 기안문 초안 버튼이 활성화됩니다.
                    ({totalItems - doneCount}개 남음)
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* ══════════════════════════════════════════════
                📝 ZONE 3 — 기안문 초안 자동 생성
            ═══════════════════════════════════════════════ */}
            <div>
              {/* 활성화 버튼 */}
              <Button
                type="button"
                disabled={!allDone}
                onClick={() => setDraftVisible((v) => !v)}
                className={cn(
                  "w-full gap-2 transition-all",
                  allDone
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md"
                    : "cursor-not-allowed"
                )}
                aria-disabled={!allDone}
              >
                {allDone ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {draftVisible ? "기안문 초안 닫기" : "✨ 기안문 초안 자동 생성"}
                    <Unlock className="h-4 w-4 ml-auto opacity-70" />
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    기안문 초안 자동 생성 (체크리스트 완료 후 활성화)
                  </>
                )}
              </Button>

              {/* 초안 패널 */}
              {allDone && draftVisible && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-semibold text-foreground">기안문 초안 뼈대</span>
                    </div>
                    {task.auto_draft_context && (
                      <CopyButton text={task.auto_draft_context} />
                    )}
                  </div>

                  {task.auto_draft_context ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-slate-800 font-mono">
                        {task.auto_draft_context}
                      </pre>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-muted-foreground">
                      기안문 초안 데이터가 없습니다. RAG 분석을 재실행해 주세요.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════
                📋 부가 정보 (접기 가능한 섹션들)
            ═══════════════════════════════════════════════ */}
            {(regulations.length > 0 || triggers.length > 0 || task.lessons_learned) && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    참고 정보
                  </p>

                  {/* 핵심 규정 */}
                  {regulations.length > 0 && (
                    <CollapseSection
                      icon={<BookOpen className="h-4 w-4 text-primary" />}
                      title="핵심 근거 규정"
                      badge={
                        <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                          {regulations.length}건
                        </span>
                      }
                    >
                      <ul className="flex flex-col gap-1.5 pt-1">
                        {regulations.map((reg, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                          >
                            <span className="shrink-0 font-mono text-xs font-bold text-primary mt-0.5">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="leading-relaxed">{reg}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapseSection>
                  )}

                  {/* 사전 액션 트리거 */}
                  {triggers.length > 0 && (
                    <CollapseSection
                      icon={<Zap className="h-4 w-4 text-amber-500" />}
                      title="사전 액션 트리거"
                      badge={
                        <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                          {triggers.length}건
                        </span>
                      }
                    >
                      <div className="flex flex-col gap-1.5 pt-1">
                        {triggers.map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Badge
                              variant="outline"
                              className="mt-0.5 shrink-0 border-amber-300 bg-amber-50 text-amber-700 font-normal text-[11px]"
                            >
                              {i + 1}
                            </Badge>
                            <span className="text-muted-foreground leading-relaxed">{t}</span>
                          </div>
                        ))}
                      </div>
                    </CollapseSection>
                  )}

                  {/* 교훈 */}
                  {task.lessons_learned && (
                    <CollapseSection
                      icon={<CheckCircle2 className="h-4 w-4 text-yellow-500" />}
                      title="교훈 및 개선점"
                    >
                      <p className="whitespace-pre-line pt-1 text-sm text-muted-foreground leading-relaxed">
                        {task.lessons_learned}
                      </p>
                    </CollapseSection>
                  )}
                </div>
              </>
            )}

          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )
}
