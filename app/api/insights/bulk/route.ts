/**
 * POST /api/insights/bulk
 * Body: { "tasks": [ RagInsight, ... ] }
 *
 * data_uploader.py 의 upload_bulk() 에서 호출합니다.
 * 한 번에 여러 건을 upsert 합니다.
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { RagInsight } from "@/lib/data"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(request: NextRequest) {
  let body: { tasks: RagInsight[] }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400, headers: CORS })
  }

  const { tasks } = body
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "tasks array is required" }, { status: 422, headers: CORS })
  }

  const payloads = tasks
    .filter((t) => !!t.task_name)
    .map((t) => ({
      task_name: t.task_name,
      target_date: t.target_date ?? null,
      core_regulations: Array.isArray(t.core_regulations) ? t.core_regulations : [],
      action_triggers: Array.isArray(t.action_triggers) ? t.action_triggers : [],
      lessons_learned: typeof t.lessons_learned === "string" ? t.lessons_learned : "",
      source_file: t.source_file ?? null,
    }))

  const { data, error } = await supabase
    .from("gyomu_tasks")
    .upsert(payloads, { onConflict: "task_name" })
    .select("task_name")

  if (error) {
    console.error("[POST /api/insights/bulk] Supabase error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  }

  return NextResponse.json(
    { inserted: data?.length ?? 0, skipped: tasks.length - payloads.length },
    { status: 200, headers: CORS }
  )
}
