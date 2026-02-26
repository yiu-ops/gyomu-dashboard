"use client";

import { useState, useMemo, useEffect } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Calendar, X, ChevronDown, FileText, Users, AlertTriangle, Package } from "lucide-react";
import { Task } from "@/lib/types";
import { CATEGORIES, getCategoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

// ── 카테고리 뱃지 ──────────────────────────────────────────────
function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const style = getCategoryStyle(category);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {category}
    </span>
  );
}

// ── 업무 카드 ──────────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={task.category} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {task.task_name}
        </h3>
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>
      {task.related_depts.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {task.related_depts.slice(0, 3).map((dept) => (
            <span key={dept} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
              {dept}
            </span>
          ))}
          {task.related_depts.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">
              +{task.related_depts.length - 3}
            </span>
          )}
        </div>
      )}
      {task.timeline.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400 border-t border-gray-100 pt-2">
          <Calendar className="w-3 h-3" />
          <span>일정 {task.timeline.length}건</span>
        </div>
      )}
    </div>
  );
}

// ── 상세보기 다이얼로그 ────────────────────────────────────────
function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const style = getCategoryStyle(task.category);
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
          {/* 헤더 */}
          <div className={cn("px-6 py-5 border-b", style.bg, style.border)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CategoryBadge category={task.category} />
                <Dialog.Title className="mt-2 text-base font-bold text-gray-900 leading-snug">
                  {task.task_name}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="mt-1 rounded-full p-1 hover:bg-black/10 transition">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 px-6 py-5 space-y-6">
            {/* 개요 */}
            <section>
              <SectionTitle icon={<FileText className="w-4 h-4" />} title="업무 개요" />
              <p className="text-sm text-gray-700 leading-relaxed mt-2">{task.description}</p>
            </section>

            {/* 주의사항 */}
            {task.precautions.length > 0 && (
              <section>
                <SectionTitle icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} title="주의사항" />
                <ul className="mt-2 space-y-1.5">
                  {task.precautions.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 일정 */}
            {task.timeline.length > 0 && (
              <section>
                <SectionTitle icon={<Calendar className="w-4 h-4 text-blue-500" />} title="주요 일정" />
                <div className="mt-2 space-y-2">
                  {task.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-blue-600 font-mono whitespace-nowrap flex-shrink-0">{t.date}</span>
                      <span className="text-gray-700">{t.action}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 관련 부서 */}
            {task.related_depts.length > 0 && (
              <section>
                <SectionTitle icon={<Users className="w-4 h-4 text-green-500" />} title="관련 부서" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.related_depts.map((d) => (
                    <span key={d} className="text-sm bg-gray-100 text-gray-700 rounded-full px-3 py-1">
                      {d}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 산출물 */}
            {task.deliverables.length > 0 && (
              <section>
                <SectionTitle icon={<Package className="w-4 h-4 text-violet-500" />} title="산출물 / 제출 서류" />
                <ul className="mt-2 space-y-1">
                  {task.deliverables.map((d, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-violet-400">▸</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* 메타 */}
          <div className="px-6 py-3 border-t bg-gray-50 text-xs text-gray-400">
            출처: {task._meta.source_zip ?? "—"} / {task._meta.filename}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-800">
      {icon}
      {title}
    </div>
  );
}

// ── 메인 대시보드 ──────────────────────────────────────────────
export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("전체");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: Task[]) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  // Tab 1 – 필터링된 업무 목록
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchCat = selectedCat === "전체" || t.category === selectedCat;
      const matchSearch =
        search === "" ||
        t.task_name.includes(search) ||
        t.description.includes(search);
      return matchCat && matchSearch;
    });
  }, [tasks, selectedCat, search]);

  // Tab 3 – 타임라인
  const timelineTasks = useMemo(() => {
    return tasks
      .filter((t) => t.timeline.length > 0)
      .flatMap((t) =>
        t.timeline.map((tl) => ({ ...tl, task_name: t.task_name, category: t.category, task: t }))
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">교</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">교무지원과 업무 관리 시스템</h1>
            <p className="text-xs text-gray-500">총 {tasks.length}건의 업무</p>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        <RadixTabs.Root defaultValue="all">
          <RadixTabs.List className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6">
            {[
              { value: "all", label: "📋 전체 업무" },
              { value: "category", label: "⚡ 카테고리별" },
              { value: "timeline", label: "🗓️ 타임라인" },
            ].map((tab) => (
              <RadixTabs.Trigger
                key={tab.value}
                value={tab.value}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-500 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {tab.label}
              </RadixTabs.Trigger>
            ))}
          </RadixTabs.List>

          {/* ── Tab 1: 전체 업무 ── */}
          <RadixTabs.Content value="all">
            {/* 검색 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="업무명 또는 설명으로 검색..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["전체", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    selectedCat === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 카드 그리드 */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">일치하는 업무가 없습니다.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((task, i) => (
                  <TaskCard key={i} task={task} onClick={() => setSelectedTask(task)} />
                ))}
              </div>
            )}
          </RadixTabs.Content>

          {/* ── Tab 2: 카테고리별 ── */}
          <RadixTabs.Content value="category">
            <Accordion.Root type="single" collapsible className="space-y-2">
              {CATEGORIES.map((cat) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                if (catTasks.length === 0) return null;
                const style = getCategoryStyle(cat);
                return (
                  <Accordion.Item
                    key={cat}
                    value={cat}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <Accordion.Trigger className="w-full flex items-center justify-between px-5 py-4 text-left group">
                      <div className="flex items-center gap-3">
                        <CategoryBadge category={cat} />
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", style.bg, style.text)}>
                          {catTasks.length}건
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                    <Accordion.Content className="overflow-hidden data-[state=open]:animate-none">
                      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catTasks.map((task, i) => (
                          <TaskCard key={i} task={task} onClick={() => setSelectedTask(task)} />
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
            </Accordion.Root>
          </RadixTabs.Content>

          {/* ── Tab 3: 타임라인 ── */}
          <RadixTabs.Content value="timeline">
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-0">
              {timelineTasks.map((item, i) => (
                <div key={i} className="relative mb-6">
                  {/* 점 */}
                  <div className="absolute -left-[1.65rem] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-400" />
                  <div
                    className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-sm transition-all"
                    onClick={() => setSelectedTask(item.task)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-blue-600 font-semibold">{item.date}</span>
                      <CategoryBadge category={item.category} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{item.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.task_name}</p>
                  </div>
                </div>
              ))}
              {timelineTasks.length === 0 && (
                <div className="text-center py-16 text-gray-400">일정 데이터가 없습니다.</div>
              )}
            </div>
          </RadixTabs.Content>
        </RadixTabs.Root>
      </main>

      {/* 상세보기 */}
      {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
}
