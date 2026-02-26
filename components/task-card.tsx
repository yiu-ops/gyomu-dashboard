"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_COLORS } from "@/lib/data"
import type { Task } from "@/lib/data"

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const colors = CATEGORY_COLORS[task.category]

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
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
        <div className="mb-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {task.category}
          </span>
        </div>
        <CardTitle className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {task.task_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {task.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            설명이 없습니다
          </p>
        )}

        {task.related_depts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.related_depts.slice(0, 3).map((dept) => (
              <Badge
                key={dept}
                variant="secondary"
                className="text-xs font-normal"
              >
                {dept}
              </Badge>
            ))}
            {task.related_depts.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                {`+${task.related_depts.length - 3}`}
              </Badge>
            )}
          </div>
        )}

        {task.timeline.length > 0 && (
          <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{`일정 ${task.timeline.length}건`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
