"use client"

import { BookOpen } from "lucide-react"

interface DashboardHeaderProps {
  totalCount: number
}

export function DashboardHeader({ totalCount }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
              교무지원과 업무 관리 시스템
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {`총 ${totalCount}건의 업무`}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
