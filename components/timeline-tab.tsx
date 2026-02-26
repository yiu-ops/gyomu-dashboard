"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_COLORS } from "@/lib/data"
import type { Task } from "@/lib/data"

interface TimelineTabProps {
  tasks: Task[]
}

interface FlatTimelineEntry {
  date: string
  action: string
  taskName: string
  category: Task["category"]
}

export function TimelineTab({ tasks }: TimelineTabProps) {
  const entries = useMemo(() => {
    const flat: FlatTimelineEntry[] = []

    for (const task of tasks) {
      if (task.timeline.length === 0) continue
      for (const entry of task.timeline) {
        flat.push({
          date: entry.date,
          action: entry.action,
          taskName: task.task_name,
          category: task.category,
        })
      }
    }

    flat.sort((a, b) => {
      const da = Date.parse(a.date)
      const db = Date.parse(b.date)
      if (!isNaN(da) && !isNaN(db)) return da - db
      return 0
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
    <div className="relative ml-4 py-4">
      <div className="absolute left-[5px] top-6 bottom-6 w-px bg-border" />
      <ul className="flex flex-col gap-6">
        {entries.map((entry, index) => {
          const colors = CATEGORY_COLORS[entry.category]
          return (
            <li key={index} className="relative flex gap-4 pl-7">
              <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-primary bg-card" />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="w-fit font-mono text-xs shrink-0"
                  >
                    {entry.date}
                  </Badge>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    {entry.category}
                  </span>
                </div>
                <span className="text-sm text-foreground font-medium leading-relaxed">
                  {entry.action}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.taskName}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
