"use client"

import useSWR from "swr"
import { BrainCircuit, CalendarDays, ClipboardList, Layers, LayoutDashboard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskListTab } from "@/components/task-list-tab"
import { CategoryTab } from "@/components/category-tab"
import { TimelineTab } from "@/components/timeline-tab"
import { RagInsightsTab } from "@/components/rag-insights-tab"
import { CommanderView } from "@/components/commander-view"
import type { Task } from "@/lib/data"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const { data: tasks = [], isLoading, error } = useSWR<Task[]>("/api/tasks", fetcher)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-destructive">데이터를 불러오지 못했습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader totalCount={tasks.length} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
<Tabs defaultValue="commander" className="gap-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="commander" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span>지휘관 뷰</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span>전체 업무</span>
            </TabsTrigger>
            <TabsTrigger value="category" className="gap-1.5">
              <Layers className="h-4 w-4" />
              <span>카테고리별</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>타임라인</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-1.5">
              <BrainCircuit className="h-4 w-4" />
              <span>RAG 인사이트</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commander">
            <CommanderView />
          </TabsContent>

          <TabsContent value="all">
            <TaskListTab tasks={tasks} />
          </TabsContent>

          <TabsContent value="category">
            <CategoryTab tasks={tasks} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab tasks={tasks} />
          </TabsContent>

          <TabsContent value="insights">
            <RagInsightsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
