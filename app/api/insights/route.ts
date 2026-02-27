/**
 * GET  /api/insights?task_name=<name>  → 단건 조회
 * GET  /api/insights                   → 전체 목록
 * POST /api/insights                   → 단건 upsert  (data_uploader.py 호환)
 *
 * ──────────────────────────────────────────────────
 * Supabase 테이블 DDL (SQL Editor에서 실행)
 * ──────────────────────────────────────────────────
 * CREATE TABLE gyomu_tasks (
 *   id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 *   task_name        TEXT        UNIQUE NOT NULL,
 *   target_date      TEXT,
 *   core_regulations JSONB,
 *   action_triggers  JSONB,
 *   lessons_learned  TEXT,
 *   source_file      TEXT,
 *   created_at       TIMESTAMPTZ DEFAULT now(),
 *   updated_at       TIMESTAMPTZ DEFAULT now()
 * );
 *
 * CREATE OR REPLACE FUNCTION set_updated_at()
 * RETURNS TRIGGER LANGUAGE plpgsql AS $$
 * BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
 *
 * CREATE TRIGGER trg_gyomu_tasks_updated_at
 * BEFORE UPDATE ON gyomu_tasks
 * FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { RagInsight } from "@/lib/data"

// ── 공통 헤더 ────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// ── GET ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskName = searchParams.get("task_name")

  const query = supabase
    .from("gyomu_tasks")
    .select("*")
    .order("updated_at", { ascending: false })

  if (taskName) {
    query.eq("task_name", taskName)
  }

  const { data, error } = await query

  if (error) {
    console.error("[GET /api/insights] Supabase error:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CORS }
    )
  }

  // 단건 조회인데 없을 경우 404
  if (taskName && (!data || data.length === 0)) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: CORS }
    )
  }

  const result = taskName ? (data?.[0] ?? null) : (data ?? [])
  return NextResponse.json(result, { headers: CORS })
}

// ── POST (단건 upsert) ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: RagInsight

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "invalid JSON body" },
      { status: 400, headers: CORS }
    )
  }

  const { task_name, target_date, core_regulations, action_triggers, lessons_learned, source_file } = body

  if (!task_name) {
    return NextResponse.json(
      { error: "task_name is required" },
      { status: 422, headers: CORS }
    )
  }

  const payload = {
    task_name,
    target_date: target_date ?? null,
    core_regulations: Array.isArray(core_regulations) ? core_regulations : [],
    action_triggers: Array.isArray(action_triggers) ? action_triggers : [],
    lessons_learned: typeof lessons_learned === "string" ? lessons_learned : "",
    source_file: source_file ?? null,
  }

  const { data, error } = await supabase
    .from("gyomu_tasks")
    .upsert(payload, { onConflict: "task_name" })
    .select()
    .single()

  if (error) {
    console.error("[POST /api/insights] Supabase error:", error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CORS }
    )
  }

  return NextResponse.json(data, { status: 200, headers: CORS })
}
