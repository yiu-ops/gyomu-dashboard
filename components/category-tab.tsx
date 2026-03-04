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
import { ActionModal } from "@/components/action-modal"
import type { GyomuTask } from "@/lib/supabase"

interface CategoryTabProps {
  tasks: GyomuTask[]
}

export function CategoryTab({ tasks }: CategoryTabProps) {
  const [selectedTask, setSelectedTask] = useState<GyomuTask | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const grouped = useMemo(() => {
    const map: Record<string, GyomuTask[]> = {}
    for (const task of tasks) {
      const key = task.semester ?? "학기 미정"
      if (!map[key]) map[key] = []
      map[key].push(task)
    }
    return Object.entries(map).sort(([a], [b]) => {
      if (a === "학기 미정") return 1
      if (b === "학기 미정") return -1
      return b.localeCompare(a)
    })
  }, [tasks])

  return (
    <div className="flex flex-col gap-2">
      <Accordion type="multiple" className="w-full" defaultValue={grouped.map(([k]) => k)}>
        {grouped.map(([semester, semTasks]) => (
          <AccordionItem key={semester} value={semester}>
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700">
                  {semester}
                </span>
                <Badge variant="outline" className="text-xs tabular-nums font-normal">
                  {semTasks.length}건
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {semTasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  해당 학기에 등록된 업무가 없습니다
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
                  {semTasks.map((task) => (
                    <TaskCard
                      key={task.id ?? task.task_name}
                      task={task}
                      onClick={() => { setSelectedTask(task); setModalOpen(true) }}
                    />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <ActionModal task={selectedTask} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
