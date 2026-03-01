import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── D-Day 유틸리티 ──────────────────────────────────────────────────

export type DDayInfo = {
  /** 표시 문자열: "D-7", "D-Day", "D+3", "날짜 없음" 등 */
  label: string
  /** 숫자 차이 (음수 = 지남, 0 = 당일, 양수 = 남음). null = target_date 없음 */
  diff: number | null
  /** Tailwind 색상 클래스 (badge 배경/텍스트) */
  colorClass: string
}

/**
 * target_date(YYYY-MM-DD 또는 자연어)를 받아 D-Day 정보를 반환합니다.
 *
 * 색상 규칙:
 *   D-3 이내  → 빨간색 (긴급)
 *   D-7 이내  → 주황색 (경고)
 *   D-14 이내 → 노란색 (주의)
 *   D-14 초과 → 파란색 (여유)
 *   지난 날짜  → 회색
 *   날짜 없음  → 회색
 */
export function calculateDDay(targetDate: string | null | undefined): DDayInfo {
  if (!targetDate) {
    return { label: "날짜 없음", diff: null, colorClass: "bg-gray-100 text-gray-500" }
  }

  // YYYY-MM-DD 형식이 아닌 경우 (예: "2025-1학기 말") 파싱 시도만
  const parsed = new Date(targetDate)
  if (isNaN(parsed.getTime())) {
    return { label: targetDate, diff: null, colorClass: "bg-gray-100 text-gray-500" }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)

  const diffMs = parsed.getTime() - today.getTime()
  const diff = Math.round(diffMs / (1000 * 60 * 60 * 24))

  let label: string
  if (diff === 0) label = "D-Day"
  else if (diff > 0) label = `D-${diff}`
  else label = `D+${Math.abs(diff)}`

  let colorClass: string
  if (diff < 0) {
    colorClass = "bg-gray-100 text-gray-500"          // 지남
  } else if (diff <= 3) {
    colorClass = "bg-red-100 text-red-700 ring-1 ring-red-300"   // 긴급
  } else if (diff <= 7) {
    colorClass = "bg-orange-100 text-orange-700 ring-1 ring-orange-300" // 경고
  } else if (diff <= 14) {
    colorClass = "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300" // 주의
  } else {
    colorClass = "bg-blue-100 text-blue-700"          // 여유
  }

  return { label, diff, colorClass }
}
