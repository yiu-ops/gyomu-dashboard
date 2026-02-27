import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import type { Task } from "@/lib/data"

export async function GET() {
  const filePath = join(process.cwd(), "public", "output.json")
  const raw: Task[] = JSON.parse(readFileSync(filePath, "utf-8"))
  // 텍스트가 없어 건너뛴 항목은 제외
  const tasks = raw.filter((t) => t._parse_status !== "skipped_empty")
  return NextResponse.json(tasks)
}

// ── 이하 mock 데이터 (사용하지 않음, 참고용으로 보존) ────────────────
const _mockTasks: Task[] = [
  {
    category: "교원인사",
    task_name: "2026학년도 1학기 신규 전임교원 임용",
    description:
      "2026학년도 1학기 신규 전임교원 공개채용 및 임용 업무를 수행합니다. 채용 공고 게시, 서류 심사, 면접 및 학과 심의, 교원인사위원회 심의, 임용 후보자 확정 및 임용장 수여까지의 전 과정을 관리합니다.",
    precautions: [
      "채용 공고 시 교육부 가이드라인 준수 필수",
      "심사위원 이해충돌 여부 사전 확인",
      "외국인 교원 비자 및 체류자격 확인",
      "임용 서류 개인정보 보호 철저",
    ],
    timeline: [
      { date: "2025-09-01", action: "채용 수요 조사 및 T/O 확정" },
      { date: "2025-10-15", action: "채용 공고 게시" },
      { date: "2025-11-20", action: "서류 접수 마감" },
      { date: "2025-12-10", action: "서류 심사 및 면접" },
      { date: "2026-01-15", action: "교원인사위원회 심의" },
      { date: "2026-02-01", action: "임용 확정 및 통보" },
    ],
    related_depts: ["교무처", "각 학과사무실", "인사팀", "법무팀"],
    deliverables: [
      "채용 공고문",
      "서류 심사 결과표",
      "면접 평가서",
      "교원인사위원회 회의록",
      "임용장",
    ],
    _parse_status: "ok",
    _meta: {
      source_zip: "2026_교원인사_신규임용.zip",
      folder_in_zip: "DOC",
      filename: "신규교원_임용계획.hwp",
      extension: ".hwp",
    },
  },
  {
    category: "비전임조교관리",
    task_name: "2026학년도 1학기 비전임조교 위촉 관리",
    description:
      "2026학년도 1학기 비전임조교(대학원 조교, 시간제 조교) 위촉 및 관리 업무입니다. 학과별 조교 수요 파악, 위촉 서류 접수, 근무 조건 안내 및 수당 지급 관리를 포함합니다.",
    precautions: [
      "대학원생 조교 장학금과 중복 수혜 여부 확인",
      "근로시간 상한 준수 (주 20시간 이내)",
      "4대 보험 가입 대상 여부 확인",
    ],
    timeline: [
      { date: "2026-01-10", action: "학과별 조교 수요 조사" },
      { date: "2026-02-01", action: "조교 위촉 서류 접수" },
      { date: "2026-02-15", action: "위촉 심사 및 확정" },
      { date: "2026-03-02", action: "조교 근무 시작" },
    ],
    related_depts: ["각 학과사무실", "대학원", "재무처"],
    deliverables: [
      "조교 수요 조사표",
      "위촉 서류 체크리스트",
      "조교 위촉장",
      "수당 지급 명세서",
    ],
    _parse_status: "ok",
    _meta: {
      source_zip: "2026_비전임조교_위촉.zip",
      folder_in_zip: "ATTDOC",
      filename: "비전임조교_위촉현황.xlsx",
      extension: ".xlsx",
    },
  },
  {
    category: "교원업적평가",
    task_name: "2025학년도 교원 업적평가 실시",
    description:
      "2025학년도 전임교원 업적평가(연구, 교육, 봉사)를 실시합니다. 교원별 자기평가서 접수, 학과 평가, 대학 평가위원회 심의를 거쳐 최종 평가 결과를 확정하고, 재임용 및 승진 심사 자료로 활용합니다.",
    precautions: [
      "평가 기준 변경사항 사전 공지 필수",
      "이의신청 절차 및 기간 안내 철저",
      "평가 결과 개인정보 보호 유의",
      "정년보장 심사 대상자 별도 관리",
    ],
    timeline: [
      { date: "2026-01-05", action: "업적평가 안내 공지" },
      { date: "2026-01-20", action: "자기평가서 접수 마감" },
      { date: "2026-02-05", action: "학과 평가 완료" },
      { date: "2026-02-20", action: "대학 평가위원회 심의" },
      { date: "2026-03-05", action: "평가 결과 통보 및 이의신청 접수" },
    ],
    related_depts: ["교무처", "각 학과사무실", "연구처", "교육혁신원"],
    deliverables: [
      "업적평가 안내문",
      "자기평가서 양식",
      "학과 평가 결과 보고서",
      "최종 업적평가 결과표",
    ],
    _parse_status: "ok",
    _meta: {
      source_zip: "2025_업적평가.zip",
      folder_in_zip: "DOC",
      filename: "업적평가_실시계획.pdf",
      extension: ".pdf",
    },
  },
  {
    category: "위원회운영",
    task_name: "2026년도 제1차 교원인사위원회 운영",
    description:
      "2026년도 제1차 교원인사위원회 개최를 위한 준비 및 운영 업무입니다. 안건 취합, 회의 자료 작성, 위원 소집 통보, 회의 진행 및 회의록 작성, 의결 사항 후속 처리를 포함합니다.",
    precautions: [
      "위원 정족수 충족 여부 사전 확인",
      "안건별 이해관계 위원 제척 처리",
      "비공개 안건 보안 유지",
    ],
    timeline: [
      { date: "2026-01-20", action: "안건 취합 및 정리" },
      { date: "2026-01-25", action: "회의 자료 작성 및 배포" },
      { date: "2026-01-28", action: "위원 소집 통보" },
      { date: "2026-02-05", action: "교원인사위원회 개최" },
      { date: "2026-02-10", action: "회의록 작성 및 의결사항 통보" },
    ],
    related_depts: ["교무처", "인사팀", "법무팀", "총장실"],
    deliverables: [
      "회의 안건 목록",
      "회의 자료집",
      "교원인사위원회 회의록",
      "의결사항 통보 공문",
    ],
    _parse_status: "ok",
    _meta: {
      source_zip: "2026_위원회_1차.zip",
      folder_in_zip: "ATT",
      filename: "인사위원회_안건.hwp",
      extension: ".hwp",
    },
  },
  {
    category: "교원연수출장",
    task_name: "2026학년도 상반기 교원 해외 연수 지원",
    description:
      "2026학년도 상반기 전임교원 해외 연수(학술대회 참가, 공동연구, 단기방문) 지원 업무입니다. 연수 신청 접수, 심사, 예산 배정 및 출장 서류 처리를 수행합니다.",
    precautions: [
      "연수 기간 중 강의 대체 방안 사전 확보",
      "여행자보험 가입 확인",
      "귀국 후 결과보고서 제출 기한 안내",
    ],
    timeline: [
      { date: "2026-01-15", action: "해외 연수 신청 공고" },
      { date: "2026-02-15", action: "신청서 접수 마감" },
      { date: "2026-02-28", action: "심사 및 대상자 확정" },
      { date: "2026-03-15", action: "출장 서류 및 예산 집행" },
    ],
    related_depts: ["교무처", "연구처", "국제교류원", "재무처"],
    deliverables: [
      "해외 연수 신청 공고문",
      "연수 신청서 및 계획서",
      "심사 결과 보고서",
      "출장 명령서",
      "귀국 결과보고서 양식",
    ],
    _parse_status: "ok",
    _meta: {
      source_zip: "2026_교원연수_상반기.zip",
      folder_in_zip: "ATTDOC",
      filename: "해외연수_지원계획.pdf",
      extension: ".pdf",
    },
  },
]
