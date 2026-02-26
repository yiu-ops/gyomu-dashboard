"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TaskCard } from "@/components/task-card"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { ALL_CATEGORIES, CATEGORY_COLORS } from "@/lib/data"
import type { Task, Category } from "@/lib/data"

interface TaskListTabProps {
  tasks: Task[]
}

export function TaskListTab({ tasks }: TaskListTabProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const filteredTasks = useMemo(() => {
    let result = tasks

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.task_name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }

    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory)
    }

    return result
  }, [tasks, searchQuery, selectedCategory])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="업무명 또는 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
          aria-label="업무 검색"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리 필터">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          전체
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isActive ? null : cat)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? `${colors.bg} ${colors.text} ring-1 ${colors.ring}`
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          )
        })}
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
              key={task.task_name}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
