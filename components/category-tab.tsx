"use client"

import { useMemo, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "@/components/task-card"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { ALL_CATEGORIES, CATEGORY_COLORS } from "@/lib/data"
import type { Task, Category } from "@/lib/data"

interface CategoryTabProps {
  tasks: Task[]
}

export function CategoryTab({ tasks }: CategoryTabProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const grouped = useMemo(() => {
    const map: Record<Category, Task[]> = {} as Record<Category, Task[]>
    for (const cat of ALL_CATEGORIES) {
      map[cat] = []
    }
    for (const task of tasks) {
      if (map[task.category]) {
        map[task.category].push(task)
      }
    }
    return map
  }, [tasks])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-2">
      <Accordion type="multiple" className="w-full">
        {ALL_CATEGORIES.map((cat) => {
          const catTasks = grouped[cat]
          const colors = CATEGORY_COLORS[cat]
          return (
            <AccordionItem key={cat} value={cat}>
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {cat}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs tabular-nums font-normal"
                  >
                    {catTasks.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {catTasks.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    해당 카테고리에 등록된 업무가 없습니다
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
                    {catTasks.map((task) => (
                      <TaskCard
                        key={task.task_name}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                      />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
