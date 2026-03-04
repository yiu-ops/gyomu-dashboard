"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ActionModal } from "@/components/action-modal"
import { cn, calculateDDay } from "@/lib/utils"
import type { GyomuTask } from "@/lib/supabase"

interface TimelineTabProps {
  tasks: GyomuTask[]
}

interface FlatEntry {
  absoluteDate: string | null
  dTag: string | null
  action: string
  task: GyomuTask
}

function parseTrigger(trigger: string, targetDate: string | null): FlatEntry {
  const m = trigger.match(/^(D[+-]?\d+):\s*(.+)$/)
  if (!m) return { absoluteDate: null, dTag: null, action: trigger, task: null! }
  const dTag = m[1]
  const action = m[2]
  if (!targetDate) return { absoluteDate: null, dTag, action, task: null! }
  const target = new Date(targetDate)
  if (isNaN(target.getTime())) return { absoluteDate: null, dTag, action, task: null! }
  const offset = parseInt(dTag.replace("D", "").replace("+", ""))
  if (isNaN(offset)) return { absoluteDate: null, dTag, action, task: null! }
  const d = new Date(target)
  d.setDate(d.getDate() + offset)
  const abs = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  return { absoluteDate: abs, dTag, action, task: null! }
}

export function TimelineTab({ tasks }: TimelineTabProps) {
  const [selectedTask, setSelectedTask] = useState<GyomuTask | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const entries = useMemo(() => {
    const flat: FlatEntry[] = []
    for (const task of tasks) {
      if (task.target_date) {
        flat.push({ absoluteDate: task.target_date, dTag: "D-Day", action: `[마감] ${task.task_name}`, task })
      }
      for (const trigger of task.action_triggers ?? []) {
        const e = parseTrigger(trigger, task.target_date)
        flat.push({ ...e, task })
      }
    }
    flat.sort((a, b) => {
      if (!a.absoluteDate && !b.absoluteDate) return 0
      if (!a.absoluteDate) return 1
      if (!b.absoluteDate) return -1
      return a.absoluteDate.localeCompare(b.absoluteDate)
    })
    return flat
  }, [tasks])

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">일정 데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative ml-4 py-4">
        <div className="absolute left-[5px] top-6 bottom-6 w-px bg-border" />
        <ul className="flex flex-col gap-5">
          {entries.map((entry, index) => {
            const dday = entry.absoluteDate ? calculateDDay(entry.absoluteDate) : null
            return (
              <li
                key={index}
                className="relative flex gap-4 pl-7 cursor-pointer group"
                onClick={() => { setSelectedTask(entry.task); setModalOpen(true) }}
              >
                <div className={cn(
                  "absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 bg-card",
                  dday?.section === "urgent" ? "border-orange-400" :
                  dday?.section === "overdue" ? "border-gray-400" : "border-primary"
                )} />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.absoluteDate && (
                      <Badge variant="outline" className="w-fit font-mono text-xs shrink-0">
                        {entry.absoluteDate}
                      </Badge>
                    )}
                    {entry.dTag && (
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                        dday?.colorClass ?? "bg-gray-100 text-gray-500"
                      )}>
                        {entry.dTag}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-foreground font-medium leading-relaxed group-hover:text-primary transition-colors">
                    {entry.action}
                  </span>
                  {!entry.action.startsWith('[마감]') && (
                    <span className="text-xs text-muted-foreground">{entry.task.task_name}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <ActionModal task={selectedTask} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
