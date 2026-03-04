"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TaskCard } from "@/components/task-card"
import { ActionModal } from "@/components/action-modal"
import type { GyomuTask } from "@/lib/supabase"

interface TaskListTabProps {
  tasks: GyomuTask[]
}

export function TaskListTab({ tasks }: TaskListTabProps) {
  const [selectedTask, setSelectedTask] = useState<GyomuTask | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const q = searchQuery.toLowerCase()
    return tasks.filter(
      (t) =>
        t.task_name.toLowerCase().includes(q) ||
        (t.lessons_learned ?? "").toLowerCase().includes(q) ||
        (t.early_warning ?? "").toLowerCase().includes(q)
    )
  }, [tasks, searchQuery])

  const handleTaskClick = (task: GyomuTask) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="업무명 또는 교훈/주의사항 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
          aria-label="업무 검색"
        />
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id ?? task.task_name}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      <ActionModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
