"use client"

import {
  AlertCircle,
  CheckSquare,
  Clock,
  Users,
  FileText,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CATEGORY_COLORS } from "@/lib/data"
import type { Task } from "@/lib/data"

interface TaskDetailSheetProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
}: TaskDetailSheetProps) {
  if (!task) return null

  const colors = CATEGORY_COLORS[task.category]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="mb-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              {task.category}
            </span>
          </div>
          <SheetTitle className="text-lg leading-snug text-foreground pr-8">
            {task.task_name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {task.task_name} 업무 상세 정보
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)] px-6 pb-6">
          <div className="flex flex-col gap-6">
            {/* Description */}
            {task.description && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  업무 설명
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              </section>
            )}

            <Separator />

            {/* Precautions */}
            {task.precautions.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  유의사항
                </h3>
                <ul className="flex flex-col gap-2">
                  {task.precautions.map((precaution, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive/70" />
                      <span className="leading-relaxed">{precaution}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {task.precautions.length > 0 && <Separator />}

            {/* Timeline */}
            {task.timeline.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  일정
                </h3>
                <div className="relative ml-2">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  <ul className="flex flex-col gap-4">
                    {task.timeline.map((entry, index) => (
                      <li key={index} className="relative flex gap-3 pl-5">
                        <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-primary bg-card" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-primary">
                            {entry.date}
                          </span>
                          <span className="text-sm text-muted-foreground leading-relaxed">
                            {entry.action}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {task.timeline.length > 0 && <Separator />}

            {/* Related Departments */}
            {task.related_depts.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  관련 부서
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.related_depts.map((dept) => (
                    <Badge key={dept} variant="secondary" className="font-normal">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {task.related_depts.length > 0 && <Separator />}

            {/* Deliverables */}
            {task.deliverables.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  제출물
                </h3>
                <ul className="flex flex-col gap-2">
                  {task.deliverables.map((deliverable, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span>{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
