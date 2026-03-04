"use client"

import { AlertOctagon, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, calculateDDay } from "@/lib/utils"
import type { GyomuTask } from "@/lib/supabase"

interface TaskCardProps {
  task: GyomuTask
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const dday = calculateDDay(task.target_date)

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group",
        dday.section === "overdue" && "border-red-200 opacity-80",
        dday.section === "urgent" && "border-orange-200"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${task.task_name} 상세 보기`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
            dday.colorClass
          )}>
            {dday.label}
          </span>
          {task.semester && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
              <CalendarClock className="h-2.5 w-2.5" />
              {task.semester}
            </span>
          )}
        </div>
        <CardTitle className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {task.task_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {task.early_warning ? (
          <div className="flex items-start gap-1.5 rounded-md bg-red-50 border border-red-100 px-2.5 py-2">
            <AlertOctagon className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed line-clamp-2">{task.early_warning}</p>
          </div>
        ) : task.lessons_learned ? (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {task.lessons_learned}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">분석 내용이 없습니다</p>
        )}

        {task.target_date && (
          <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>마감: {task.target_date}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
